from typing import Dict, List, Optional

from pydantic import BaseModel, Field, create_model

from cache.CacheBaseModel import CacheBaseModel, generate_cache_model
from db.MongoBaseModel import MongoBaseModel


class _Benchmark(BaseModel):
    output_length: int
    generated: int
    actual: int
    throughput: int
    fifty: float = Field(
        alias="50%",
    )
    ninety_nine: float = Field(alias="99%")
    language: str


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
    api_key: str
    healthStatus: Optional[ServiceStatus]
    benchmarks: Optional[Dict[str, List[_Benchmark]]]


ServiceCache = create_model(
    "ServiceCache",
    __base__=CacheBaseModel,
    **generate_cache_model(Service, primary_key_field="serviceId")
)
