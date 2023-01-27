from fastapi import Depends
from db.database import Database
from ..model import Model
from pydantic import parse_obj_as


class ModelRepository:
    __collection_name__ = "model"

    def __init__(self, db: Database = Depends(Database)) -> None:
        self.collection: dict = db[self.__collection_name__]

    def find_by_id(self, model_id: str) -> Model:
        return Model(**self.collection[model_id])

    def find_all(self) -> dict[str, Model]:
        models = parse_obj_as(dict[str, Model], self.collection)
        return models
