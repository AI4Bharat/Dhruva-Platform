import os

from dotenv import load_dotenv
from pymongo.database import Database

load_dotenv(override=True)

db_clients = dict()


def AppDatabase() -> Database:
    mongo_db = db_clients["app"][os.environ["APP_DB_NAME"]]
    return mongo_db


def LogDatabase() -> Database:
    mongo_db = db_clients["log"][os.environ["LOG_DB_NAME"]]
    return mongo_db
