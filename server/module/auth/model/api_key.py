from typing import Any, Optional

from db.MongoBaseModel import MongoBaseModel


class ApiKey(MongoBaseModel):
    name: str
    key: str
    masked_key: str
    active: bool
    user: str
    type: str
