# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as v1_router
from .db import init_pool_and_db, close_pool

app = FastAPI(title="ReadySetRead API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add ReadySetRead.com prod domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_pool_and_db()

@app.on_event("shutdown")
async def shutdown():
    await close_pool()

@app.get("/")
def root():
    return {"message": "ReadySetRead API is running"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

app.include_router(v1_router)
