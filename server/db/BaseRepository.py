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

    def find_by_id(self, id: str) -> Optional[T]:
        results = self.collection.find_one({"_id": id})
        if results:
            return self.__map_to_model(results)
        raise Exception

    def find_one(self, query: dict) -> Optional[T]:
        results = self.collection.find_one(query)
        if results:
            return self.__map_to_model(results)
        raise Exception

    def find(self, query: dict) -> Optional[List[T]]:
        results = self.collection.find(query)
        if results:
            return self.__map_to_model_list(results)
        raise Exception

    def find_all(self) -> Optional[List[T]]:
        results = self.collection.find()
        if results:
            return self.__map_to_model_list(results)
        raise Exception

    def delete_one(self, query: dict):
        try:
            self.collection.delete_one(query)
        except:
            raise Exception

    def delete_many(self, query: dict) -> int:
        try:
            count = self.collection.delete_many(query)
            return count.deleted_count
        except:
            raise Exception

    def insert_one(self, data: T) -> object:
        try:
            document = self.__map_to_document(data)
            result = self.collection.insert_one(document)
            return result.inserted_id
        except Exception as e:
            raise e
