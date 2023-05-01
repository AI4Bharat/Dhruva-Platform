from datetime import datetime
from typing import Optional

import redis
from bson import ObjectId
from bson.int64 import Int64
from pydantic import Extra, Field, root_validator
from redis_om import Field as RedisField
from redis_om import HashModel
from redis_om.model.model import PrimaryKey

from .app_cache import get_cache_connection


# Ignore these fields when creating models from Mongo DB Model Schemas
EXCLUDED_FIELDS = ["id", "key", "services"]
ACCEPTED_FIELD_TYPES = (str, int, float, bytes, bool, ObjectId, Int64, datetime)


class CacheBaseModel(HashModel):
    """Base Model for all Cached values"""

    # id Field in MongoBase is not working as expected when using with HashModel subclasses
    # Hence overriding it explicitly here
    id: Optional[str] = Field(default=None, alias="_id")

    class Meta:
        global_key_prefix: str = "Dhruva"
        # TODO: Generate model_key_prefix without 'pydantic.main'
        # model_key_prefix: str = None
        database: redis.Redis = get_cache_connection()
        primary_key: Optional[PrimaryKey] = None
        embedded: bool = False
        encoding: str = "utf-8"

    class Config(HashModel.Config):
        extra: Extra.ignore
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = False

    @root_validator(pre=True)
    def validate_fields(cls, values):
        """Remove unwanted fields and convert arbitrary objects to str for Cache"""

        # Remove all extra fields since overriding Config doesn't seem to work
        all_fields = [v for v in values]
        for v in all_fields:
            if (v not in cls.__fields__ and v != "_id") or (
                type(values[v]) not in ACCEPTED_FIELD_TYPES
            ):
                # Temporary special case for models
                if v == "task" and cls.__name__ == "ModelCache":
                    values["task_type"] = values[v]["type"]
                values.pop(v)

        # Redis: A tuple item must be str, int, float or bytes
        # Manually convert everything else to str since overriding Config doesn't seem to work
        # print("values: ", values)
        for v in values:
            if isinstance(values.get(v), ObjectId):
                values[v] = str(values[v])
            elif isinstance(values.get(v), bool):
                values[v] = str(values[v])
            elif isinstance(values.get(v), Int64):
                values[v] = int(values[v])
            elif isinstance(values.get(v), datetime):
                values[v] = values[v].isoformat()
        return values


def generate_cache_model(cls, primary_key_field):
    model_definition = {}
    for key, value in cls.__fields__.items():
        field = {}
        if key not in EXCLUDED_FIELDS:
            if value.default:
                field = {key: (value.type_, RedisField(value.default))}
            elif value.type_ == ObjectId:
                field = {key: (str, RedisField(...))}
            elif key == primary_key_field:
                field = {key: (str, RedisField(..., primary_key=True))}
            elif value.type_ in ACCEPTED_FIELD_TYPES and not value.sub_fields:
                # For a list of str value.type_ gives str as result which is misleading
                # Hence using sub_fields instead to check for complex types
                field = {key: (value.type_, RedisField(...))}
            # Temporary special case for models
            elif key == "task" and cls.__name__ == "Model":
                field = {"task_type": (str, RedisField(...))}
            else:
                # Skip for all nested types. Not supported in Cache
                continue

        model_definition.update(field)
    return model_definition
