from fastapi import Depends
from db.BaseRepository import BaseRepository
from db.app_db import AppDatabase
from ..model import Service


class ServiceRepository(BaseRepository[Service]):
    __collection_name__ = "service"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        self.collection = db[self.__collection_name__]
