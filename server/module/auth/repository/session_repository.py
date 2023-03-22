from fastapi import Depends
from pymongo.database import Database

from db.BaseRepository import BaseRepository
from db.database import AppDatabase

from ..model import Session
from ..model.user import User


class SessionRepository(BaseRepository[Session]):
    __collection_name__ = "session"

    def __init__(self, db: Database = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)
