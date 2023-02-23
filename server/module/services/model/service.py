from typing import Any, List,Optional
from pydantic import BaseModel

class _PayloadObject(BaseModel):
    payload: str
    latency: str
    generated: str
    actual: str
    metricName:str
    metricValue:str

class _Benchmark(BaseModel):
    name:str
    payloads:List[_PayloadObject]


class Service(BaseModel):
    _id: Optional[Any]
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    key:str
    benchmarks:Optional[List[_Benchmark]]
