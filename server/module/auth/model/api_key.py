from datetime import datetime
from typing import List, Optional

import pydantic
from bson import ObjectId

from cache.CacheBaseModel import CacheBaseModel, generate_cache_model
from db.MongoBaseModel import MongoBaseModel


class _ServiceUsage(pydantic.BaseModel):
    service_id: str
    usage: int = 0
    hits: int = 0


class ApiKey(MongoBaseModel):
    name: str
    api_key: str
    masked_key: str
    active: bool
    user_id: ObjectId
    type: str
    created_timestamp: datetime
    usage: int = 0
    hits: int = 0
    data_tracking: bool
    services: List[_ServiceUsage] = []

    def revoke(self):
        self.active = False

    def activate(self):
        self.active = True

    def enable_tracking(self):
        self.data_tracking = True

    def disable_tracking(self):
        self.data_tracking = False


ApiKeyCache = pydantic.create_model(
    "ApiKeyCache",
    __base__=CacheBaseModel,
    **generate_cache_model(ApiKey, primary_key_field="api_key")
)
