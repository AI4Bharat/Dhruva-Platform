from typing import Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from ...common import ObjectIdField


class _Benchmark(BaseModel):
    output_length: int
    generated: int
    actual: int
    throughput: int
    fifty: float = Field(alias="50%")
    ninety_nine: float = Field(alias="99%")
    language: str


class ServiceStatus(BaseModel):
    status: str
    lastUpdated: str


class ServiceResponse(BaseModel):
    id: ObjectIdField = Field(alias="_id")
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    healthStatus: Optional[ServiceStatus]
    benchmarks: Optional[Dict[str, List[_Benchmark]]]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
        }
