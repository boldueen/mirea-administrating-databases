from .db import get_pg_conn, get_mongo_client
from .schemas import CreateWorker, Worker, CreateProduct, Product
from .settings import Settings

from pydantic import parse_obj_as
from bson.objectid import ObjectId
from fastapi import HTTPException


async def test():
    conn = await get_pg_conn()
    cursor = conn.cursor()

    cursor.execute(
        f"""
            SELECT 1;
        """
    )

    is_password_correct = cursor.fetchone()[0]

    return is_password_correct


async def get_products():
    client = get_mongo_client()
    db = client.get_database(name=Settings.MONGO_DB)
    products = db.products.find()
    response = []
    for product in products:
        # print(type(product['_id']), product['_id'])
        p = Product(
            id=str(product['_id']),
            name=product['name'],
            category=product.get('category'),
            price=product.get('price')
        )
        response.append(p)
    return parse_obj_as(list[Product], response)


async def create_product(product: CreateProduct):
    client = get_mongo_client()
    db = client.get_database(Settings.MONGO_DB)

    data = {
        "name": product.name,
        "category": product.category,
        "price": product.price

    }

    db.products.insert_one(data)

    return f'product {product.name} created'


async def delete_product(product_id: str):
    client = get_mongo_client()
    db = client.get_database(name=Settings.MONGO_DB)
    products = db.products.delete_one({'_id': ObjectId(product_id)})
    return f'{products.deleted_count} product was deleted'


async def get_workers():
    conn = await get_pg_conn()
    cursor = conn.cursor()

    cursor.execute(
        f"""
            SELECT * from workers;
        """
    )

    workers = cursor.fetchall()
    return parse_obj_as(list[Worker], workers)


async def create_worker(worker: CreateWorker):
    conn = await get_pg_conn()
    cursor = conn.cursor()

    try:
        cursor.execute(
            f"""
                INSERT INTO workers(name, email, phone) values ('{worker.name}', '{worker.email}', '{worker.phone}');
            """
        )
        if cursor.rowcount >= 1:
            return f'Success! worker {worker.name} created!'
    except Exception as e:
        raise HTTPException(status_code=404, detail=e.args)


async def delete_worker_by_id(worker_id: int):
    conn = await get_pg_conn()
    cursor = conn.cursor()

    workers = cursor.execute(
        f"""
            DELETE FROM workers WHERE workers.id={worker_id};
        """
    )
    return f'{cursor.rowcount} worker(s) deleted'

    return workers
