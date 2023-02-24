from typing import Any

import pymongo
from fastapi.logger import logger
from pymongo.collection import Collection
from pymongo.database import Database


class LogDatabase:
    __db: Database = None  # type: ignore

    def __init__(self) -> None:
        # currently loads registries from the file
        # in the future when the db is implemented:
        #   - connect to db and get database object
        #   - optionally create collections

        if self.__db != None:
            return

        mongo_client = pymongo.MongoClient(
            "mongodb://admin:adminlocalhost@log_db:27018/"
        )
        mongo_db = mongo_client["dhruva"]
        logger.info("Connected to log database")
        self.__db = mongo_db

    def __getitem__(self, collection_name) -> Collection[Any]:
        return self.__db.get_collection(collection_name)

    # def load_collections(self):
    #     from .BaseRepository import BaseRepository

    #     collections = BaseRepository.__subclasses__()
    #     print(collections)
