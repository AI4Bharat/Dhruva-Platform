from fastapi import Depends
from db.BaseRepository import BaseRepository
from db.app_db import AppDatabase
class ModelRepository(BaseRepository):
    __collection_name__ = "model"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        self.collection = db[self.__collection_name__]
