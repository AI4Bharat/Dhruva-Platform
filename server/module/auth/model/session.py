import datetime
from enum import Enum
from typing import Any

from bson import ObjectId

from db.MongoBaseModel import MongoBaseModel


class Session(MongoBaseModel):
    user_id: ObjectId
    type: str
    timestamp: datetime.datetime
