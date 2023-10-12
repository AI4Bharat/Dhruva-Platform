import os
from typing import Dict, Optional

from dotenv import load_dotenv
from pymongo.database import Database
from pymongo.mongo_client import MongoClient

load_dotenv()

db_client: Dict[str, Optional[MongoClient]] = {}


def AppDatabase() -> Database:
    mongo_db = db_client["app"][os.environ["APP_DB_NAME"]] # type: ignore
    return mongo_db
