from typing import Any

import pymongo
from fastapi.logger import logger
from pymongo.collection import Collection
from pymongo.database import Database


class AppDatabase:
    __db: Database = None  # type: ignore

    def __init__(self) -> None:
        if self.__db != {}:
            return

        mongo_client = pymongo.MongoClient("mongodb://admin:admin@app_db:27017/")
        mongo_db = mongo_client["dhruva"]
        logger.info("Connected to app database")
        self.__db = mongo_db

    def __getitem__(self, collection_name) -> Collection[Any]:
        return self.__db.get_collection(collection_name)
