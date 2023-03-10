from typing import Optional
from fastapi import Depends

from db.app_db import AppDatabase
from db.BaseRepository import BaseRepository

from ..model import Service


class ServiceRepository(BaseRepository[Service]):
    __collection_name__ = "service"

    def __init__(self, db: AppDatabase = Depends(AppDatabase)) -> None:
        super().__init__(db, self.__collection_name__)

    def find_by_id(self, id: str) -> Optional[Service]:
        return super().find_one({"serviceId": id})
