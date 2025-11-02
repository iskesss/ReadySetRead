import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# TODO: backend team make sure to set this up later in AWS app runner / docker compose
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # fallback lets you start the app even without a database :)
    "postgresql+psycopg://postgres:postgres@localhost:5432/postgres",
)

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
