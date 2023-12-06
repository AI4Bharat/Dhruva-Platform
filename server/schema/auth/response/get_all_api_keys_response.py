from typing import List
from pydantic import BaseModel, validator
from schema.auth.common import ApiKey, ServiceLevelApiKeyDisplay


class _ApiKey(ApiKey):
    id: str

    @validator("id", pre=True)
    def typecast_id_to_str(cls, v):
        return str(v)


class GetAllApiKeysResponse(BaseModel):
    api_keys: List[_ApiKey]


class GetAllApiKeysDetailsResponse(BaseModel):
    api_keys: List[_ApiKey]
    total_usage: int = 0


class GetServiceLevelApiKeysResponse(BaseModel):
    api_keys: List[ServiceLevelApiKeyDisplay]
    total_usage: int = 0
