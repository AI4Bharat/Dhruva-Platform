from fastapi import Depends
from pymongo.database import Database

from db.BaseRepository import BaseRepository
from db.database import AppDatabase

from ..model import Feedback


class FeedbackRepository(BaseRepository[Feedback]):
    __collection_name__ = "feedback"

    def __init__(self, db: Database = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)