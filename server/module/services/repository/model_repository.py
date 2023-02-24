from typing import Optional
from fastapi import Depends

from db.app_db import AppDatabase
from db.BaseRepository import BaseRepository

from ..model import Model


class ModelRepository(BaseRepository[Model]):
    __collection_name__ = "model"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)

    def find_by_id(self, id: str) -> Optional[Model]:
        return super().find_one({"modelId": id})

    def get_by_id(self, id: str) -> Model:
        return super().get_one({"modelId": id})
