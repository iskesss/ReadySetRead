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
from .quiz_llm import generate_quiz_for_book, generate_quiz_feedback

ADULTS_TABLE = db.ADULTS_TABLE
CHILDREN_TABLE = db.CHILDREN_TABLE
QUIZZES_TABLE = db.QUIZZES_TABLE
CUSTOM_REWARDS_TABLE = db.CUSTOM_REWARDS_TABLE

router = APIRouter(prefix="/v1")

# SIGNUP / SIGNIN
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
    bg_skin: str = "default"

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

# BOOKS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
class BookOut(BaseModel):
    book_id: int
    title: str
    reading_level: int
    author: str

# QUIZZES
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
class AssignQuizRequest(BaseModel):
    child_id: int
    book_id: int

class QuizOut(BaseModel):
    quiz_id: int
    child_id: int
    book_id: int
    attempted: bool
    passed: bool
    score: int
    feedback: str


class QuizFeedbackOut(BaseModel):
    quiz_id: int
    feedback: str

class QuizUpdateOut(BaseModel): #Same as quizOut but with num coins earned
    quiz_out: QuizOut
    coinsEarned: int

class UpdateQuizRequest(BaseModel):
    quiz_id: int
    score: int = Field(ge=0, le=10, description="Quiz score from 0 to 10")

class UpdateQuizFeedbackRequest(BaseModel):
    quiz_id: int
    quiz_questions: GenerateQuizResponse  # The full quiz with 10 questions
    child_responses: list[str] = Field(min_length=10, max_length=10, description="Child's 10 responses to the quiz questions")

class QuizStatsOut(BaseModel):
    failed: int
    passed: int
    not_attempted: int

# COINS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
class SpendCoinsRequest(BaseModel):
    coins_to_spend: int = Field(gt=0, description="Number of coins to deduct (must be positive)")

class SpendCoinsResponse(BaseModel):
    success: bool
    remaining_coins: int
    message: str

class GetCoinsResponse(BaseModel):
    child_id: int
    num_coins: int

class GetBackgroundSkinResponse(BaseModel):
    bg_skin: str

class UpdateBackgroundSkinRequest(BaseModel):
    new_skin: str = Field(max_length=16, description="Background skin identifier")

# CUSTOM REWARDS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
class CreateCustomRewardRequest(BaseModel):
    child_id: int
    description: str = Field(min_length=1, max_length=500)
    coin_cost: int = Field(ge=0, description="Cost in coins (has to be non-negative)")
    adult_email: EmailStr

class CustomRewardOut(BaseModel):
    reward_id: int
    child_id: int
    description: str
    coin_cost: int
    adult_email: EmailStr

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
                    f"SELECT child_id, child_name, num_coins, adult_email, bg_skin FROM {CHILDREN_TABLE} WHERE child_id = %s", (child_id,)
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

# ADULT AUTH
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
                SELECT child_id, child_name, num_coins, adult_email, bg_skin
                FROM {CHILDREN_TABLE}
                WHERE adult_email = %s
                ORDER BY child_name
                """,
                (adult_email,)
            )
            rows = await db_cursor.fetchall()
            return [ChildOut(**row) for row in rows] # return a list of child JSON objects

# CHILD AUTH
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
                RETURNING child_id, child_name, num_coins, adult_email, bg_skin
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
    current_child: ChildOut = Depends(get_current_child),
):
    questions_dicts = generate_quiz_for_book(
        book_title=payload.book_title,
        author=payload.author,
        reading_level=payload.reading_level,
        num_questions=payload.num_questions,
    )

    questions = [QuizQuestion(**q) for q in questions_dicts] # converts raw dicts into pydantic models

    return GenerateQuizResponse(questions=questions)

# BOOKS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.get("/books", response_model=list[BookOut]) # no auth required for this one
async def list_all_books():
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"SELECT book_id, title, reading_level, author FROM {db.BOOKS_TABLE} ORDER BY reading_level"
            )
            rows = await db_cursor.fetchall()
            return [BookOut(**row) for row in rows]

# QUIZ ASSIGNMENT
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_

# Helper function to combine authorization for quiz assignment
async def get_current_user(request: Request) -> AdultOut | ChildOut:
    try:
        return await get_current_adult(request)
    except HTTPException:
        return await get_current_child(request)
    

@router.post("/quiz/assign", response_model=QuizOut, status_code=201)
async def assign_quiz(
    payload: AssignQuizRequest,
    current_user: AdultOut | ChildOut = Depends(get_current_user) # auth definitely required!
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute( # make sure that the child exists and belongs to the authenticated adult
                f"SELECT child_id, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (payload.child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            # make sure the book exists
            await db_cursor.execute(
                f"SELECT book_id FROM {db.BOOKS_TABLE} WHERE book_id = %s",
                (payload.book_id,)
            )
            book_row = await db_cursor.fetchone()
            if not book_row:
                raise HTTPException(status_code=404, detail="That book does not seem to exist")

            # make sure a quiz doesn't already exist for this child-book combination
            await db_cursor.execute(
                f"SELECT quiz_id FROM {QUIZZES_TABLE} WHERE child_id = %s AND book_id = %s",
                (payload.child_id, payload.book_id)
            )
            existing_quiz = await db_cursor.fetchone()
            if existing_quiz:
                raise HTTPException(status_code=409, detail="A quiz for this book has already been assigned to the specified child") # TODO:  verify this is actually returning the appropriate HTTP error code 

            # insert new quiz (leave many fields blank)
            await db_cursor.execute(
                f"""
                INSERT INTO {QUIZZES_TABLE} (child_id, book_id, attempted, passed, score, feedback)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING quiz_id, child_id, book_id, attempted, passed, score, feedback
                """,
                (payload.child_id, payload.book_id, False, False, 0, "")
            )
            row = await db_cursor.fetchone()
            if not row:
                raise HTTPException(status_code=500, detail="Failed to create quiz assignment")

            return QuizOut(**row) # ** casts the DB row dictionary into a pydantic-validated AdultOut class


@router.get("/child/{child_id}/quizzes", response_model=list[QuizOut])
async def list_quizzes_for_child(
    child_id: int,
    current_user: AdultOut | ChildOut = Depends(get_current_user)
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # verify the child exists and get their corresponding adult_email
            await db_cursor.execute(
                f"SELECT child_id, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            # auth check: child can only view their own quizzes, adult can only view their children's quizzes
            if isinstance(current_user, ChildOut):
                if current_user.child_id != child_id:
                    raise HTTPException(status_code=403, detail="You can't view other kids' quizzes!")
            elif isinstance(current_user, AdultOut):
                if current_user.adult_email != child_row["adult_email"]:
                    raise HTTPException(status_code=403, detail="You can only view your own kids' quizzes!")

            # fetch all quizzes for this child
            await db_cursor.execute(
                f"""
                SELECT quiz_id, child_id, book_id, attempted, passed, score, feedback
                FROM {QUIZZES_TABLE}
                WHERE child_id = %s
                ORDER BY quiz_id
                """,
                (child_id,)
            )
            rows = await db_cursor.fetchall()
            return [QuizOut(**row) for row in rows]


@router.get("/child/{child_id}/quiz-stats", response_model=QuizStatsOut)
async def get_quiz_stats_for_child(
    child_id: int,
    current_user: AdultOut | ChildOut = Depends(get_current_user)
):
    #quiz stats for a child: count of failed, passed, and not attempted quizzes
    
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"SELECT child_id, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            if isinstance(current_user, ChildOut):
                if current_user.child_id != child_id:
                    raise HTTPException(status_code=403, detail="You can't view other kids' quiz stats!")
            elif isinstance(current_user, AdultOut):
                if current_user.adult_email != child_row["adult_email"]:
                    raise HTTPException(status_code=403, detail="You can only view your own kids' quiz stats!")

            # count failed quizzes (attempted but not passed)
            await db_cursor.execute(
                f"SELECT COUNT(*) FROM {QUIZZES_TABLE} WHERE child_id = %s AND attempted = true AND passed = false",
                (child_id,)
            )
            failed = (await db_cursor.fetchone())[0]
            
            # count passed quizzes
            await db_cursor.execute(
                f"SELECT COUNT(*) FROM {QUIZZES_TABLE} WHERE child_id = %s AND passed = true",
                (child_id,)
            )
            passed = (await db_cursor.fetchone())[0]
            
            # count not attempted quizzes
            await db_cursor.execute(
                f"SELECT COUNT(*) FROM {QUIZZES_TABLE} WHERE child_id = %s AND attempted = false",
                (child_id,)
            )
            not_attempted = (await db_cursor.fetchone())[0]
            
            return QuizStatsOut(
                failed=failed,
                passed=passed,
                not_attempted=not_attempted
            )


@router.get("/quiz/{quiz_id}/feedback", response_model=QuizFeedbackOut)
async def get_quiz_feedback(quiz_id, current_user): 
    #return stored feedback for a quiz. adults can only access feedback for their own children, and children can only access their own quizzes
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(f"SELECT quiz_id, child_id, feedback FROM {QUIZZES_TABLE} WHERE quiz_id = %s", (quiz_id,))
            row = await db_cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="quiz not found")

            # making sure a child may only access their own quizzes
            if isinstance(current_user, ChildOut):
                if row["child_id"] != current_user.child_id:
                    raise HTTPException(status_code=403, detail="can't view other kids quizzes!")
                
            # making sure if its an adult, they can only access their own child's quizzes
            else:  
                await db_cursor.execute(f"SELECT adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s", (row["child_id"],))
                child_row = await db_cursor.fetchone()
                if not child_row or child_row["adult_email"] != current_user.adult_email:
                    raise HTTPException(status_code=403, detail="you can only view your own kids quizzes!")

            return QuizFeedbackOut(quiz_id=row["quiz_id"], feedback=row.get("feedback") or "")

@router.post("/quiz/update", response_model=QuizUpdateOut)
async def update_quiz_result(
    payload: UpdateQuizRequest,
    current_child: ChildOut = Depends(get_current_child)
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # fetch the current quiz record to get previous state of it 
            await db_cursor.execute(
                f"""
                SELECT quiz_id, child_id, book_id, attempted, passed, score, feedback
                FROM {QUIZZES_TABLE}
                WHERE quiz_id = %s
                """,
                (payload.quiz_id,)
            )
            quiz_row = await db_cursor.fetchone()
            if not quiz_row:
                raise HTTPException(status_code=404, detail="Quiz not found!")

            # Verify this quiz belongs to the authenticated child
            if quiz_row["child_id"] != current_child.child_id:
                raise HTTPException(status_code=403, detail="You can't write to other kids' quizzes!")

            # determine new passed status
            new_passed = payload.score == 10
            previous_passed = quiz_row["passed"]

            # figure out how many coins we should be awarding to the child
            if payload.score == 10 and not previous_passed:
                coins_to_add = 50
            else:
                coins_to_add = payload.score

            # update the quiz record (set attempted=true, passed based on score, & update score)
            await db_cursor.execute(
                f"""
                UPDATE {QUIZZES_TABLE}
                SET attempted = true, passed = %s, score = %s
                WHERE quiz_id = %s
                RETURNING quiz_id, child_id, book_id, attempted, passed, score, feedback
                """,
                (new_passed, payload.score, payload.quiz_id)
            )
            updated_quiz = await db_cursor.fetchone()
            if not updated_quiz:
                raise HTTPException(status_code=500, detail="Failed to update quiz")

            # update kid's coins
            await db_cursor.execute(
                f"""
                UPDATE {CHILDREN_TABLE}
                SET num_coins = num_coins + %s
                WHERE child_id = %s
                """,
                (coins_to_add, current_child.child_id)
            )

            # commit the transaction to the DB
            await db_connection.commit()

            return QuizUpdateOut(quizOut=QuizOut(**updated_quiz), coinsEarned=coins_to_add)


@router.post("/quiz/update-feedback")
async def update_quiz_feedback( # generate and then store AI feedback for a quiz that a child has completed. this function does not return the feedback itself to the frontend
    payload: UpdateQuizFeedbackRequest,
    current_child: ChildOut = Depends(get_current_child)
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"""
                SELECT quiz_id, child_id
                FROM {QUIZZES_TABLE}
                WHERE quiz_id = %s 
                """,
                (payload.quiz_id,)
            )
            quiz_row = await db_cursor.fetchone()
            if not quiz_row:
                raise HTTPException(status_code=404, detail="Quiz not found!")

            # make sure this quiz belongs to the authenticated child
            if quiz_row["child_id"] != current_child.child_id:
                raise HTTPException(status_code=403, detail="You can't update other kids' quizzes!")

            # verify that we have exactly 10 questions and 10 responses
            if len(payload.quiz_questions.questions) != 10:
                raise HTTPException(
                    status_code=422,
                    detail="Quiz must contain exactly 10 questions"
                )
            if len(payload.child_responses) != 10:
                raise HTTPException(
                    status_code=422,
                    detail="Must provide exactly 10 responses"
                )

            # convert pydantic models to python dictionaries  for the feedback generator
            questions_dicts = [ q.model_dump() for q in payload.quiz_questions.questions]

            # want to run generate_quiz_feedback in a separate thread pool cause it makes a synchronous openai api call and would thereby otherwise block fastapi from handling anything else
            feedback = await asyncio.to_thread( generate_quiz_feedback, questions=questions_dicts, child_responses=payload.child_responses )

            # once we recieve the feedback, we update the feedback column in db
            await db_cursor.execute(
                f"""
                UPDATE {QUIZZES_TABLE}
                SET feedback = %s
                WHERE quiz_id = %s
                """,
                (feedback, payload.quiz_id)
            )

            await db_connection.commit()

            return {"message": "Feedback generated and stored successfully"}

# COIN ENDPOINTS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.get("/child/{child_id}/coins", response_model=GetCoinsResponse) # fetch the number of coins for a specified child. this endpoint is callable by both adults and children.
async def get_coins(
    child_id: int,
    current_user: AdultOut | ChildOut = Depends(get_current_user)
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # verify the child exists and get their info
            await db_cursor.execute(
                f"SELECT child_id, num_coins, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            # auth check: children can only view their own coins, adults can only view their children's coins
            if isinstance(current_user, ChildOut):
                if current_user.child_id != child_id:
                    raise HTTPException(status_code=403, detail="You can't view other kids' coins!")
            elif isinstance(current_user, AdultOut):
                if current_user.adult_email != child_row["adult_email"]:
                    raise HTTPException(status_code=403, detail="You can only view your own kids' coins!")

            return GetCoinsResponse(
                child_id=child_row["child_id"],
                num_coins=child_row["num_coins"]
            )

@router.post("/child/spend-coins", response_model=SpendCoinsResponse)
async def spend_coins(
    payload: SpendCoinsRequest,
    current_child: ChildOut = Depends(get_current_child)
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # fetch current coin balance
            await db_cursor.execute(
                f"SELECT num_coins FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (current_child.child_id,)
            )
            row = await db_cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Child not found!")

            current_coins = row["num_coins"]

            # check if the kid currently has enough coins
            if current_coins < payload.coins_to_spend:
                return SpendCoinsResponse(
                    success=False,
                    remaining_coins=current_coins,
                    message=f"You have insufficient coins! You have {current_coins} coins but need {payload.coins_to_spend}."
                )

            # deduct coins
            new_balance = current_coins - payload.coins_to_spend
            await db_cursor.execute(
                f"""
                UPDATE {CHILDREN_TABLE}
                SET num_coins = %s
                WHERE child_id = %s
                """,
                (new_balance, current_child.child_id)
            )

            # commit the transaction
            await db_connection.commit()

            return SpendCoinsResponse(
                success=True,
                remaining_coins=new_balance,
                message=f"You have successfully spent {payload.coins_to_spend} coins!"
            )

# BACKGROUND SKIN ENDPOINTS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.get("/child/background-skin", response_model=GetBackgroundSkinResponse)
async def get_background_skin(
    current_child: ChildOut = Depends(get_current_child)
):
    #this endpoint gets the current bg skin for the authenticated child
    return GetBackgroundSkinResponse(bg_skin=current_child.bg_skin)

@router.post("/child/background-skin", response_model=GetBackgroundSkinResponse)
async def update_background_skin(
    payload: UpdateBackgroundSkinRequest,
    current_child: ChildOut = Depends(get_current_child)
):
    #this endpoint updates the bg skin for the authenticated child
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            await db_cursor.execute(
                f"""
                UPDATE {CHILDREN_TABLE}
                SET bg_skin = %s
                WHERE child_id = %s
                RETURNING bg_skin
                """,
                (payload.new_skin, current_child.child_id)
            )
            row = await db_cursor.fetchone()
            if not row:
                raise HTTPException(status_code=500, detail="Failed to update background skin")

            await db_connection.commit()

            return GetBackgroundSkinResponse(bg_skin=row["bg_skin"])

# CUSTOM REWARDS ENDPOINTS
# —_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_–_–_—_—_—_—_—_
@router.post("/custom-rewards", response_model=CustomRewardOut, status_code=201)
async def create_custom_reward( # create a custom reward for a child.
    payload: CreateCustomRewardRequest,
    current_adult: AdultOut = Depends(get_current_adult) # adult auth is important for this one
):

    # gotta verify that the adult_email from the request matches the authenticated adult
    if current_adult.adult_email != payload.adult_email:
        raise HTTPException(
            status_code=403,
            detail="You can only create rewards using your own email address!"
        )

    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # verify that the child exists and belongs to the authenticated adult
            await db_cursor.execute(
                f"""SELECT child_id, adult_email FROM {CHILDREN_TABLE} 
                WHERE child_id = %s""",
                (payload.child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            if child_row["adult_email"] != current_adult.adult_email:
                raise HTTPException(
                    status_code=403,
                    detail="you can only create rewards for your own children..."
                )

            # upsert the custom reward
            await db_cursor.execute(
                f"""
                INSERT INTO {CUSTOM_REWARDS_TABLE} (child_id, description, coin_cost, adult_email)
                VALUES (%s, %s, %s, %s)
                RETURNING reward_id, child_id, description, coin_cost, adult_email
                """,
                (payload.child_id, payload.description, payload.coin_cost, payload.adult_email)
            )
            row = await db_cursor.fetchone()
            if not row:
                raise HTTPException(status_code=500, detail="Failed to create custom reward")

            await db_connection.commit()

            return CustomRewardOut(**row)

@router.get("/child/{child_id}/custom-rewards", response_model=list[CustomRewardOut])
async def list_custom_rewards_for_child(
    child_id: int,
    current_user: AdultOut | ChildOut = Depends(get_current_user) # either adults can view their rewards assigned to a specific child, or that specific child can view the awards assigned to them
):
    pool = require_pool()
    async with pool.connection() as db_connection:
        db_connection.row_factory = dict_row
        async with db_connection.cursor() as db_cursor:
            # verify the child exists and also get their corresponding adultEmail
            await db_cursor.execute(
                f"SELECT child_id, adult_email FROM {CHILDREN_TABLE} WHERE child_id = %s",
                (child_id,)
            )
            child_row = await db_cursor.fetchone()
            if not child_row:
                raise HTTPException(status_code=404, detail="Child not found!")

            # we need to verify that kids can only view their own rewards and that adults can only view their kid's rewards
            if isinstance(current_user, ChildOut):
                if current_user.child_id != child_id:
                    raise HTTPException(status_code=403, detail="You can't view other kid's' rewards!")
            elif isinstance(current_user, AdultOut):
                if current_user.adult_email != child_row["adult_email"]:
                    raise HTTPException(status_code=403, detail="You can only view your own kids' rewards!")

            # fetch all custom rewards for this particular child
            await db_cursor.execute(
                f"""
                SELECT reward_id, child_id, description, coin_cost, adult_email
                FROM {CUSTOM_REWARDS_TABLE}
                WHERE child_id = %s
                ORDER BY reward_id
                """,
                (child_id,)
            )
            rows = await db_cursor.fetchall()
            return [CustomRewardOut(**row) for row in rows]

