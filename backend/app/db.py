# app/db.py
import os
from psycopg_pool import AsyncConnectionPool

DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA = os.getenv("DB_SCHEMA", "prod_schema")
ADULTS_TABLE = f"{SCHEMA}.adults"
CHILDREN_TABLE = f"{SCHEMA}.children"
BOOKS_TABLE = f"{SCHEMA}.books"
QUIZZES_TABLE = f"{SCHEMA}.quizzes"

pool: AsyncConnectionPool | None = None

async def init_pool_and_db():
    global pool
    if not DATABASE_URL:
        raise RuntimeError("The DATABASE_URL is not set")
    pool = AsyncConnectionPool(DATABASE_URL, min_size=1, max_size=10)
    try:
        await pool.open()
    except Exception as exc:
        raise RuntimeError(f"The DB isn't reachable: {exc}") from exc # if you're running the uvicorn server locally, pls make sure your dev computer's IP address is whitelisted by AWS RDS

async def close_pool():
    global pool
    if pool:
        await pool.close()
        pool =None
