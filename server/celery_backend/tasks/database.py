import os

import pymongo
from dotenv import load_dotenv
from pymongo.database import Database

load_dotenv(override=True)

db_clients = {
    # For some reason with the latest changes the quotes in the fields in .env are getting sent to python
    # Removing the quotes from the string in .env without removing them from the URL
    "app": pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"]),
}

if os.environ.get("LOG_REQUEST_RESPONSE_DATA_FLAG", None):
    db_clients["log"] = pymongo.MongoClient(os.environ["LOG_DB_CONNECTION_STRING"])


def AppDatabase() -> Database:
    mongo_db = db_clients["app"][os.environ["APP_DB_NAME"]]
    return mongo_db


def LogDatabase() -> Database:
    mongo_db = db_clients["log"][os.environ["LOG_DB_NAME"]]
    return mongo_db
