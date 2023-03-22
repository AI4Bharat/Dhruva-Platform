from typing import Optional

from fastapi import Depends
from pymongo.database import Database

from db.BaseRepository import BaseRepository
from db.database import AppDatabase

from ..model import Model


class ModelRepository(BaseRepository[Model]):
    __collection_name__ = "model"

    def __init__(self, db: Database = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)

    def find_by_id(self, id: str) -> Optional[Model]:
        return super().find_one({"modelId": id})

    def get_by_id(self, id: str) -> Model:
        return super().get_one({"modelId": id})

    def delete_one(self, id: str):
        result = self.collection.delete_one({"modelId": id})
        return result.deleted_count
        
    def update_one(self, data: dict) -> int:
        result = self.collection.update_one({"modelId": data['modelId']}, {"$set": data})
        return result.modified_count
