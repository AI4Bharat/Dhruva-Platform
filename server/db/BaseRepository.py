from .app_db import AppDatabase
from .log_db import LogDatabase
from typing import Union


class BaseRepository:
    def __init__(self, db: Union[AppDatabase, LogDatabase], collection_name: str) -> None:
        self.db = db
        self.collection = db[collection_name]

    def find_by_id(self, id : str) -> object:
        return self.collection.find_one({"_id": id})
    
    def find_one(self, query: dict) -> object:
        return self.collection.find_one(query)

    def find(self, query: dict) -> object:
        return self.collection.find(query)

    def delete_one(self, query: dict) -> object:
        self.collection.delete_one(query)

    def delete_many(self, query: dict) -> int:
        count = self.collection.delete_many(query)
        return count.deleted_count

    def insert_one(self, data: object) -> object:
        self.collection.insert_one(data)