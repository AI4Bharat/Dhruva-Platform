import os
from dotenv import load_dotenv
import pymongo
from pymongo.database import Database


load_dotenv()

db_clients = {
    "app": pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"]),
}

if os.environ.get("LOG_REQUEST_RESPONSE_DATA_FLAG", None):
    db_clients["log"] = pymongo.MongoClient(os.environ["LOG_DB_CONNECTION_STRING"])


def AppDatabase() -> Database:
    mongo_db = db_clients["app"]["dhruva"]
    return mongo_db


def LogDatabase() -> Database:
    mongo_db = db_clients["log"]["dhruva"]
    return mongo_db