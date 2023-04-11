from typing import Optional
from pydantic import create_model,BaseModel
from redis_om import Field as RedisField
from db.MongoBaseModel import MongoBaseModel
from cache.CacheBaseModel import CacheBaseModel, generate_cache_model


class ServiceStatus(BaseModel):
    status: str
    lastUpdated: str

class Service(MongoBaseModel):
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    api_key:str
    healthStatus: Optional[ServiceStatus]


ServiceCache = create_model(
    "ServiceCache",
    __base__=CacheBaseModel,
    **generate_cache_model(Service, primary_key_field="serviceId")
)
