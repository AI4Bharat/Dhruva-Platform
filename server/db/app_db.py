import os
from typing import Any

import pymongo
from dotenv import load_dotenv
from fastapi.logger import logger
from pymongo.collection import Collection
from pymongo.database import Database

load_dotenv()


class AppDatabase:
    __db: Database = None  # type: ignore

    def __init__(self) -> None:
        if self.__db != None:
            return

        mongo_client = pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"])
        mongo_db = mongo_client["dhruva"]
        logger.info("Connected to app database")
        self.__db = mongo_db

    def __getitem__(self, collection_name) -> Collection[Any]:
        return self.__db[collection_name]
