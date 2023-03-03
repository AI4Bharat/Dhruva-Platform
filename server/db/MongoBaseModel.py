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

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, RoleType: str}

    def dict(
        self,
        *,
        include: Optional[
            Union[AbstractSet[Union[int, str]], Mapping[Union[int, str], Any]]
        ] = None,
        exclude: Optional[
            Union[AbstractSet[Union[int, str]], Mapping[Union[int, str], Any]]
        ] = None,
        by_alias: bool = True,
        skip_defaults: Optional[bool] = None,
        exclude_unset: bool = False,
        exclude_defaults: bool = False,
        exclude_none: bool = True,
    ) -> Dict[str, Any]:
        return super().dict(
            include=include,
            exclude=exclude,
            by_alias=by_alias,
            skip_defaults=skip_defaults,
            exclude_unset=exclude_unset,
            exclude_defaults=exclude_defaults,
            exclude_none=exclude_none,
        )


pydantic.json.ENCODERS_BY_TYPE[ObjectId] = str  # type: ignore
