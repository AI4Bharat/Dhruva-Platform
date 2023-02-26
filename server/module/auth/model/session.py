import datetime
from enum import Enum
from typing import Any

from db.MongoBaseModel import MongoBaseModel


class Session(MongoBaseModel):
    email: str
    type: str
    timestamp: datetime.datetime
