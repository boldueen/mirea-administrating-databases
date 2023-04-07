from dotenv import load_dotenv
import os


load_dotenv()


class Settings:
    APP_PORT = os.environ.get('APP_PORT')

    POSTGRES_USER = os.environ.get('POSTGRES_USER')
    POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD')
    POSTGRES_DB = os.environ.get('POSTGRES_DB')
    POSTGRES_HOST = os.environ.get('POSTGRES_HOST')
    POSTGRES_PORT = os.environ.get('POSTGRES_PORT')

    MONGO_HOST = os.environ.get('MONGO_HOST')
    MONGO_PORT = os.environ.get('MONGO_PORT')
    MONGO_USER = os.environ.get('MONGO_USER')
    MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD')
    MONGO_DB = os.environ.get('MONGO_DB')
