from fastapi import Depends

from db.app_db import AppDatabase
from db.BaseRepository import BaseRepository

from ..model.user import User


class UserRepository(BaseRepository[User]):
    __collection_name__ = "user"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)
