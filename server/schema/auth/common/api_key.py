from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class _ServiceUsage(BaseModel):
    service_id: str
    usage: int


class BaseApiKey(BaseModel):
    name: str


class ApiKey(BaseApiKey):
    masked_key: str
    active: bool
    type: str
    created_timestamp: datetime
    services: List[_ServiceUsage]
    data_tracking: bool


class ServiceLevelApiKeyDisplay(BaseApiKey):
    usage: int = 0
