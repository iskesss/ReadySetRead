# app/api.py
import os, time
from typing import Literal
import asyncio
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr, Field
from jose import jwt, JWTError
import bcrypt
from psycopg.rows import dict_row
from . import db
from .quiz_llm import generate_quiz_for_book, QuizQuestionDict

ADULTS_TABLE = db.ADULTS_TABLE
CHILDREN_TABLE = db.CHILDREN_TABLE

router = APIRouter(prefix="/v1")

# JORDAN'S GLORIOUS PYDANTIC SCHEMAS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
class AdultSignup(BaseModel):
    adult_email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    adult_name: str | None = Field(default=None, max_length=120)

class AdultOut(BaseModel):
    adult_email: EmailStr
    adult_name: str | None = None

class ChildSignup(BaseModel):
    child_name: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+( [A-Za-z0-9_.-]+)*$" ) # ABOUT THIS REGEX: Allows one or more words w/ single spaces in between them. Doesn't allow leading/trailing or double spaces. PERMITTED CHARS: letters, numbers, _, ., and -.
    password: str = Field(min_length=4, max_length=72)
    adult_email: EmailStr

class ChildOut(BaseModel):
    child_id: int
    child_name: str
    num_coins: int
    adult_email: EmailStr

class AdultLogin(BaseModel):
    adult_email: EmailStr
    password: str = Field(min_length=8, max_length=72)

class ChildLogin(BaseModel):
    child_name: str
    password: str = Field(min_length=4, max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
# OPENAI QUIZ GENERATION
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_  

class QuizQuestion(BaseModel):
    id: str
    type: str = "multiple_choice"
    question: str
    options: list[str]
    correct_answer: str
    explanation: str | None = None


class GenerateQuizRequest(BaseModel):
    book_title: str = Field(
        description="Title of the book to generate a quiz for.",
    )
    author: str | None = Field(
        default=None,
        description="Optional author name to disambiguate editions/books.",
    )
    reading_level: str | None = Field(
        default=None,
        description="Optional reading level, e.g. '3rd grade'",
    )
    num_questions: int = Field(
        default=10,
        ge=1,
        le=20,
        description="Target number of quiz questions.",
    )


class GenerateQuizResponse(BaseModel):
    questions: list[QuizQuestion]




# JWT AUTHENTICATION HELPER FUNCTIONS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))

def _ensure_secret_length(secret: str) -> bytes:
    raw = secret.encode("utf-8")
    if len(raw) > 72:
        raise ValueError("secret exceeds bcrypt 72-byte limit")
    return raw

def hash_secret(secret: str) -> str:
    raw = _ensure_secret_length(secret)
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS) # probably overkill for MVP but I figure we might as well use salting. bcrypt makes it easy.
    return bcrypt.hashpw(raw, salt).decode("utf-8")

def verify_secret(secret: str, hashed: str) -> bool: # very important function that we use for parent and child login
    try:
        raw = _ensure_secret_length(secret)
        return bcrypt.checkpw(raw, hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False

def require_pool(): # make sure pool exists
    if db.pool is None:
        raise HTTPException(status_code=503, detail="The DB pool wasn't initialized!")
    return db.pool

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("Silly developer forgot to set a JWT secret")
if len(JWT_SECRET) < 32:
    raise RuntimeError("Silly developer set a JWT secret that's shorter than 32 chars")

JWT_ALGO = "HS256" # secure enough for our purposes
ACCESS_MIN = int(os.getenv("JWT_EXPIRES_MIN", "60"))

def create_access_token(subject: str, role: Literal["adult","child"]) -> str:
    now = int(time.time())
    payload = {"sub": subject, 
               "role": role, 
               "iat": now, 
               "exp": now + ACCESS_MIN * 60} # TODO: confirm with frontend team whether this jwt expiration time aligns with desired user experience
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def _get_current(request: Request, expect_role: Literal["adult","child"]): # This function verifies the JSON web token, checks the user's role, and then returns the current authenticated adult/child from the DB.
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split( None, 1 )[1] # grab the raw json web token out of  the auth header
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ JWT_ALGO ])
        sub = payload.get("sub")
        role = payload.get("role")
        if not sub or role != expect_role:
            raise HTTPException(status_code=401, detail="Invalid jwt token!!")
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Your jwt token is invalid or expired")

    pool = require_pool() #make sure pool exists
    async with pool.connection() as db_connection: # grab a DB connection from pool (or wait for one to be freed)
        db_connection.row_factory = dict_row # tell the DB connection to return each row as a dictionary that's keyed by column names (this needs to be done before initializing DB_cursor)
        async with db_connection.cursor() as db_cursor:
            if expect_role == "adult":
                await db_cursor.execute(
                    f"SELECT adult_email, adult_name FROM {ADULTS_TABLE} WHERE adult_email = %s", (sub,)
                )
                row = await db_cursor.fetchone() # grab the first row matching the conditions we specified in the earlier execute() call. this is where we actually pull it into Python
                if not row:
                    raise HTTPException(status_code=401, detail="User not found!")
                return AdultOut(**row) #this somewhat cryptic line casts the DB row dictionary into a pydantic-validated AdultOut class
            else: # role is child
                try:
                    child_id = int(sub)
                except (TypeError, ValueError):
                    raise HTTPException(status_code=401, detail="Invalid token")
                await db_cursor.execute(
                    f"SELECT child_id, child_name, num_coins, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s", (child_id,)
                )
                row = await db_cursor.fetchone() # grab the first row matching the conditions we specified in the earlier execute() call. this is where we actually pull it into Python
                if not row:
                    raise HTTPException(status_code=401, detail="User not found!")
                
                return ChildOut(**row) #this somewhat cryptic line casts the DB row dictionary into a pydantic-validated ChildOut class

async def get_current_adult(request: Request) -> AdultOut:
    return await _get_current(request, "adult")

async def get_current_child(request: Request) -> ChildOut:
    return await _get_current(request, "child")

# super basic route for testing
@router.get("/ping")
def ping():
    return {"message": "PONG"}

# ADULT SPECIFIC FUNCTIONS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.post("/adult/auth/signup", response_model=AdultOut, status_code=201)
async def adult_signup(payload: AdultSignup): 
    pool = require_pool()  #make sure pool exists
    async with pool.connection() as db_connection: # grab a DB connection from pool (or wait for one to be freed)
        db_connection.row_factory = dict_row # tell the DB connection to return each row as a dictionary that's keyed by column names (this needs to be done before initializing DB_cursor)
        
        async with db_connection.cursor() as db_cursor:
            try:
                hpw = hash_secret(payload.password)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc # TODO:  verify this is actually returning the appropriate HTTP error code 
            await db_cursor.execute(
                f"""
                INSERT INTO {ADULTS_TABLE} (adult_email, adult_name, password_hash)
                VALUES (%s, %s, %s)
                ON CONFLICT (adult_email) DO NOTHING
                RETURNING adult_email, adult_name
                """,
                (payload.adult_email, payload.adult_name, hpw),
            )
            row = await db_cursor.fetchone() 
            if not row:
                raise HTTPException(status_code=409, detail="Email has already been registered")
            return AdultOut(**row) #this somewhat cryptic line casts the DB row dictionary into a pydantic-validated AdultOut class

@router.post("/adult/auth/login", response_model=Token)
async def adult_login(payload: AdultLogin):
    pool = require_pool() #make sure pool exists
    async with pool.connection() as db_connection: # grab a DB connection from pool (or wait for one to be freed)
        db_connection.row_factory = dict_row # tell the DB connection to return each row as a dictionary that's keyed by column names (this needs to be done before initializing DB_cursor)
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"SELECT adult_email, password_hash FROM {ADULTS_TABLE} WHERE adult_email = %s", (payload.adult_email,)
            )

            row = await db_cursor.fetchone()
            
            if not row or not verify_secret(payload.password, row["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid Credentials!")
            access_token = create_access_token(subject=row["adult_email"], role="adult")
            return {"access_token": access_token, "token_type": "bearer"}

@router.get("/adult/me", response_model=AdultOut)
async def adult_me(current: AdultOut = Depends(get_current_adult)):
    return current

@router.get("/adult/{adult_email}/children", response_model=list[ChildOut])
async def list_children_for_adult(adult_email: EmailStr, current: AdultOut = Depends(get_current_adult)): # second parameter is meant to let the endpoint know which adult is currently logged in, so it can ensure that parents can only access their own children's data
    if current.adult_email != adult_email:
        raise HTTPException(status_code=403, detail="Hey, these ain't your kids!")

    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute( # just in case the adult account got deleted AFTER their login token was issued
                f"SELECT * FROM {ADULTS_TABLE} WHERE adult_email = %s LIMIT 1",
                (adult_email,)
            )
            if not await db_cursor.fetchone():
                raise HTTPException(status_code=404, detail="Adult account was not found")

            await db_cursor.execute(
                f"""
                SELECT child_id, child_name, num_coins, adult_email
                FROM {CHILDREN_TABLE}
                WHERE adult_email = %s
                ORDER BY child_name
                """,
                (adult_email,)
            )
            rows = await db_cursor.fetchall()
            return [ChildOut(**row) for row in rows] # return a list of child JSON objects

# CHILD-SPECIFIC FUNCTIONS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.post("/child/auth/signup", response_model=ChildOut, status_code=201)
async def child_signup(payload: ChildSignup):
    pool = require_pool() #make sure pool exists
    async with pool.connection() as db_connection: # grab a DB connection from pool (or wait for one to be freed)
        db_connection.row_factory = dict_row # tell the DB connection to return each row as a dictionary that's keyed by column names (this needs to be done before initializing DB_cursor)
        async with db_connection.cursor() as db_cursor:
            try:
                hpin = hash_secret(payload.password)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc # TODO: make sure this is the appropriate HTTP error code

            await db_cursor.execute(
                f"SELECT 1 FROM {ADULTS_TABLE} WHERE adult_email = %s", (payload.adult_email,)
            )
            if not await db_cursor.fetchone():
                raise HTTPException(status_code=404, detail="Adult account not found")

            await db_cursor.execute(
                f"SELECT 1 FROM {CHILDREN_TABLE} WHERE child_name = %s", (payload.child_name,)
            )
            if await db_cursor.fetchone():
                raise HTTPException(status_code=409, detail="Child name already taken")

            await db_cursor.execute(
                f"""
                INSERT INTO {CHILDREN_TABLE} (child_name, password_hash, adult_email)
                VALUES (%s, %s, %s)
                RETURNING child_id, child_name, num_coins, adult_email
                """,
                (payload.child_name, hpin, payload.adult_email)
            )
            row = await db_cursor.fetchone()
            return ChildOut( **row ) #this somewhat cryptic line casts the DB row dictionary into a pydantic-validated ChildOut class

@router.post("/child/auth/login", response_model=Token)
async def child_login(payload: ChildLogin):
    pool = require_pool() #make sure pool exists
    async with pool.connection() as db_connection: # grab a DB connection from pool (or wait for one to be freed)
        db_connection.row_factory = dict_row # tell the DB connection to return each row as a dictionary that's keyed by column names (this needs to be done before initializing DB_cursor)
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"SELECT child_id, password_hash FROM {CHILDREN_TABLE} WHERE child_name = %s", (payload.child_name,)
            )
            row = await db_cursor.fetchone()
            if not row or not verify_secret(payload.password, row["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            access_token = create_access_token(subject=str(row["child_id"]), role="child")
            return {"access_token": access_token, "token_type": "bearer"}

@router.get("/child/me", response_model=ChildOut)
async def child_me(current: ChildOut = Depends(get_current_child)):
    return current

# QUIZ GENERATION (LLM)
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_

@router.post("/quiz/generate", response_model=GenerateQuizResponse)
def generate_quiz_endpoint(
    payload: GenerateQuizRequest,
    #current_child: ChildOut = Depends(get_current_child),
):
    questions_dicts = generate_quiz_for_book(
        book_title=payload.book_title,
        author=payload.author,
        reading_level=payload.reading_level,
        num_questions=payload.num_questions,
    )

   
    questions = [QuizQuestion(**q) for q in questions_dicts] # converts raw dicts into pydantic models


    return GenerateQuizResponse(questions=questions)        # wrap them in the response model