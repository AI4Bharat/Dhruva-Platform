from .app_db import AppDatabase
from .log_db import LogDatabase
from typing import List, Optional, Union, Generic, TypeVar, Type
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    def __init__(self, db: Union[AppDatabase, LogDatabase], collection_name: str) -> None:
        super().__init__()
        self.db = db
        self.collection = db[collection_name]
        self.__document_class = self.__orig_bases__[0].__args__[0] # type: ignore
        self.__validate()

    def __validate(self):
        if not issubclass(self.__document_class, BaseModel):
            raise Exception("Document class should inherit BaseModel")
        if "id" not in self.__document_class.__fields__:
            raise Exception("Document class should have id field")
        if self.collection is None:
            raise Exception("Meta should contain collection name")

    def __map_to_model(self, data: dict) -> T:
        if "_id" in data:
            data["id"] = data.pop("_id")
        return self.__document_class.parse_obj(data)

    def __map_to_model_list(self, data) -> List[T]:
        return [self.__map_to_model(item) for item in data]

    def __map_to_document(self, data: T) -> dict:
        data = data.dict()
        if "id" in data:
            data["_id"] = data.pop("id")
        return data

    def find_by_id(self, id: str) -> Optional[T]:
        results = self.collection.find_one({"_id": id})
        return self.__map_to_model(results) if results else None

    def find_one(self, query: dict) -> Optional[T]:
        results = self.collection.find_one(query)
        return self.__map_to_model(results) if results else None

    def find(self, query: dict) -> Optional[List[T]]:
        results = self.collection.find(query)
        return self.__map_to_model_list(results) if results else None

    def find_all(self) -> Optional[List[T]]:
        results = self.collection.find()
        return self.__map_to_model_list(results) if results else None

    def delete_one(self, query: dict):
        self.collection.delete_one(query)

    def delete_many(self, query: dict) -> int:
        count = self.collection.delete_many(query)
        return count.deleted_count

    def insert_one(self, data: T) -> object:
        document = self.__map_to_document(data)
        result = self.collection.insert_one(document)
        return result.inserted_id
