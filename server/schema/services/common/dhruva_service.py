from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class _Benchmark(BaseModel):
    output_length: int
    generated: int
    actual: int
    throughput: int
    fifty: float = Field(alias="50%")
    ninety_nine: float = Field(alias="99%")
    language: str


class Service(BaseModel):
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    api_key: str
    benchmarks: Optional[Dict[str, List[_Benchmark]]]
