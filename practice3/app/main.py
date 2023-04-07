from fastapi import FastAPI
from .settings import Settings
from .services import test
from .db import init_tables
from .routes import api_router

app = FastAPI()

app.include_router(router=api_router, prefix='/api')


@app.on_event("startup")
async def startup():
    await init_tables()
