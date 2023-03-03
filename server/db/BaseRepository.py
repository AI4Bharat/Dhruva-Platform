from typing import Generic, List, Optional, Type, TypeVar, Union

from bson import ObjectId
from pydantic import BaseModel
from pymongo.collection import Collection

from exception.null_value_error import NullValueError

from .app_db import AppDatabase
from .log_db import LogDatabase

T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    def __init__(self, db: Union[AppDatabase, LogDatabase], collection_name: str) -> None:
        super().__init__()
        self.db = db
        self.collection: Collection = db[collection_name]
        self.__document_class = self.__orig_bases__[0].__args__[0]  # type: ignore
        self.__validate()

    def __validate(self):
        if not issubclass(self.__document_class, BaseModel):
            raise Exception("Document class should inherit BaseModel")
        if self.collection is None:
            raise Exception("Meta should contain collection name")

    def __map_to_model(self, data: dict) -> T:
        return self.__document_class.parse_obj(data)

    def __map_to_model_list(self, data) -> List[T]:
        return [self.__map_to_model(item) for item in data]

    def __map_to_document(self, data: T) -> dict:
        data = data.dict()
        return data

    def find_by_id(self, id: ObjectId) -> Optional[T]:
        results = self.collection.find_one({"_id": id})
        if results:
            return self.__map_to_model(results)

    def get_by_id(self, id: ObjectId) -> T:
        results = self.collection.find_one({"_id": id})
        if results:
            return self.__map_to_model(results)
        raise NullValueError

    def find_one(self, query: dict) -> Optional[T]:
        results = self.collection.find_one(query)
        if results:
            return self.__map_to_model(results)

    def get_one(self, query: dict) -> T:
        results = self.collection.find_one(query)
        if results:
            return self.__map_to_model(results)
        raise NullValueError

    def find(self, query: dict) -> List[T]:
        results = self.collection.find(query)
        return self.__map_to_model_list(results)

    def find_all(self) -> List[T]:
        results = self.collection.find()
        return self.__map_to_model_list(results)

    def delete_one(self, id: ObjectId):
        self.collection.delete_one({"_id": id})

    def delete_many(self, query: dict) -> int:
        count = self.collection.delete_many(query)
        return count.deleted_count

    def insert_one(self, data: T) -> object:
        document = self.__map_to_document(data)
        result = self.collection.insert_one(document)
        return result.inserted_id

    def update_one(self, data: T) -> int:
        document = self.__map_to_document(data)
        result = self.collection.update_one({"_id": document["_id"]}, {"$set": document})
        return result.modified_count
