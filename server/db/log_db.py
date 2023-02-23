import pymongo
from fastapi.logger import logger

class LogDatabase:

    __db = dict()

    def __init__(self) -> None:
        # currently loads registries from the file
        # in the future when the db is implemented:
        #   - connect to db and get database object
        #   - optionally create collections

        if self.__db != {}:
            return
        
        mongo_client = pymongo.MongoClient("mongodb://admin:admin@log_db:27017/")
        mongo_db = mongo_client["dhruva"]
        logger.info("Connected to log database")
        self.__db = mongo_db
    

    def __getitem__(self,collection_name):
        return self.__db[collection_name]

    # def load_collections(self):
    #     from .BaseRepository import BaseRepository

    #     collections = BaseRepository.__subclasses__()
    #     print(collections)