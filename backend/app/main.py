from fastapi import FastAPI

app = FastAPI(title="ReadySetRead API", version="0.1.0")

@app.get("/")
def root():
    return {"message": "ReadySetRead API is running"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}
