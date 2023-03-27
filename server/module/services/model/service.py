from pydantic import create_model
from redis_om import Field as RedisField
from db.MongoBaseModel import MongoBaseModel
from cache.CacheBaseModel import CacheBaseModel, generate_cache_model

class Service(MongoBaseModel):
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    api_key:str


ServiceCache = create_model(
    "ServiceCache",
    __base__=CacheBaseModel,
    **generate_cache_model(Service, primary_key_field="serviceId")
)
