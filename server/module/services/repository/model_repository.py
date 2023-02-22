from fastapi import Depends
from db.BaseRepository import BaseRepository
from db.app_db import AppDatabase
from ..model import Model
class ModelRepository(BaseRepository[Model]):
    __collection_name__ = "model"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        self.collection = db[self.__collection_name__]
