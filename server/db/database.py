import os
from typing import Optional

from dotenv import load_dotenv
from pymongo.database import Database

load_dotenv()

db_client: Optional[Database] = None


def AppDatabase() -> Database:
    mongo_db = db_client[os.environ["APP_DB_NAME"]] # type: ignore
    return mongo_db
