from fastapi import APIRouter

router = APIRouter(prefix="/v1")

@router.get("/ping")
def ping():
    return {"message": "PONGGGG"}

@router.get("/books")
def list_books(): # just a stub function for now
    return [
    {"id": 1, "title": "Ready Player One"},
    {"id": 2, "title": "Harry Pooter"}
]

