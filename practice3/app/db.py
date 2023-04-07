from pymongo import MongoClient
import psycopg2
from psycopg2.extras import RealDictCursor
from .settings import Settings


async def get_pg_conn():
    conn = psycopg2.connect(host=Settings.POSTGRES_HOST, dbname=Settings.POSTGRES_DB,
                            user=Settings.POSTGRES_USER, password=Settings.POSTGRES_PASSWORD, cursor_factory=RealDictCursor)

    conn.autocommit = True
    return conn


def get_mongo_client():
    connection_url = f'mongodb://{Settings.MONGO_USER}:{Settings.MONGO_PASSWORD}@{Settings.MONGO_HOST}:{Settings.MONGO_PORT}/?authMechanism=DEFAULT'
    return MongoClient(connection_url)


async def init_tables():
    conn = await get_pg_conn()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workers(
            id SERIAL,
            name varchar(50),
            email varchar(50),
            phone varchar(10));
        """)
