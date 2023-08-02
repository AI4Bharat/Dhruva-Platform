from typing import Optional

from db.BaseRepository import BaseRepository
from db.database import AppDatabase
from fastapi import Depends
from pymongo.database import Database

from ..model import Service


class ServiceRepository(BaseRepository[Service]):
    __collection_name__ = "service"

    def __init__(self, db: Database = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)

    def find_by_id(self, id: str) -> Optional[Service]:
        return super().find_one({"serviceId": id})

    def get_by_service_id(self, id: str) -> Service:
        return super().get_one({"serviceId": id})

    def delete_one(self, id: str):
        result = self.collection.delete_one({"serviceId": id})
        return result.deleted_count

    def update_one(self, data: dict) -> int:
        result = self.collection.update_one(
            {"serviceId": data["serviceId"]}, {"$set": data}
        )
        return result.modified_count
