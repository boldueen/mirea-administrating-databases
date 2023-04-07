from fastapi import APIRouter
from .services import get_workers, delete_worker_by_id, create_worker, create_product, get_products, delete_product
from .schemas import CreateWorker, CreateProduct


api_router = APIRouter()


@api_router.get('/products')
async def get_all_products():
    return await get_products()


@api_router.post('/products')
async def create_product_with_body(product: CreateProduct):
    return await create_product(product)


@api_router.delete('/products/:product_id')
async def delete_product_by_id(product_id: str):
    return await delete_product(product_id)


@api_router.get('/workers')
async def get_all_workers():
    return await get_workers()


@api_router.post('/workers')
async def create_worker_with_body(worker: CreateWorker):
    return await create_worker(worker)


@api_router.delete('/workers/{worker_id}')
async def delete_workers(worker_id: int):
    return await delete_worker_by_id(worker_id)
