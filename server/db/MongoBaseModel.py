from typing import AbstractSet, Any, Dict, Mapping, Optional, Union

import pydantic
from bson import ObjectId
from pydantic import BaseModel, Field

from schema.auth.common import RoleType


class ObjectIdField:
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid id")

        return ObjectId(value)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class MongoBaseModel(BaseModel):
    id: Optional[ObjectIdField] = Field(default=None, alias="_id")

    def dict(self, **kwargs) -> Dict[str, Any]:
        kwargs.update({"by_alias": True, "exclude_none": True})
        return super().dict(**kwargs)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, RoleType: str}
