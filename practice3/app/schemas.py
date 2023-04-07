from pydantic import BaseModel


class Worker(BaseModel):
    id: int
    name: str
    email: str
    phone: str


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float


class CreateWorker(BaseModel):
    name: str
    email: str
    phone: str


class CreateProduct(BaseModel):
    name: str
    category: str
    price: float
