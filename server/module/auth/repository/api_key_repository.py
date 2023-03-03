from db.app_db import AppDatabase
from db.BaseRepository import BaseRepository
from fastapi import Depends

from ..model.api_key import ApiKey


class ApiKeyRepository(BaseRepository[ApiKey]):
    __collection_name__ = "api_key"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)
