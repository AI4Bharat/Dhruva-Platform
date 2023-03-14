from fastapi import Depends
from pymongo.database import Database

from db.BaseRepository import BaseRepository
from db.database import AppDatabase

from ..model.api_key import ApiKey


class ApiKeyRepository(BaseRepository[ApiKey]):
    __collection_name__ = "api_key"

    def __init__(self, db: Database = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)
