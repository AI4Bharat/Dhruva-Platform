from typing import Any

from bson import ObjectId

from db.MongoBaseModel import MongoBaseModel


class ApiKey(MongoBaseModel):
    name: str
    key: str
    masked_key: str
    active: bool
    user_id: ObjectId
    type: str
