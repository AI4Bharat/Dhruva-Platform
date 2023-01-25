from fastapi import Depends
# from db.BaseCollection import BaseCollection
from db.database import Database
from ..model import Service
from pydantic import parse_obj_as


class ServiceRepository:
    __collection_name__ = "service"

    def __init__(self, db: Database = Depends(Database)) -> None:
        self.collection: dict = db[self.__collection_name__]

    def find_by_id(self, service_id: str) -> Service:
        return Service(**self.collection[service_id])

    def find_all(self) -> dict[str, Service]:
        services = parse_obj_as(dict[str, Service], self.collection)
        return services
