import pymongo
from fastapi.logger import logger

class AppDatabase:

    __db = dict()

    def __init__(self) -> None:
        if self.__db != {}:
            return

        mongo_client = pymongo.MongoClient("mongodb://admin:admin@app_db:27017/")
        mongo_db = mongo_client["dhruva"]
        logger.info("Connected to app database")
        self.__db = mongo_db

    def __getitem__(self,collection_name):
        return self.__db[collection_name]
