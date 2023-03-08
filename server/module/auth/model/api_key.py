from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel
from db.MongoBaseModel import MongoBaseModel


class _ServiceUsage(BaseModel):
    service_id: str
    usage: int = 0

class ApiKey(MongoBaseModel):
    name: str
    key: str
    masked_key: str
    active: bool
    user_id: ObjectId
    type: str
    usage: int = 0
    services: List[_ServiceUsage] = []
