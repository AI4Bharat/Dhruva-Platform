from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .ulca_task import _ULCATask


class _OAuthId(BaseModel):
    oauthId: str
    provider: str


class _SubmitterDetails(BaseModel):
    name: str
    aboutMe: Optional[str]
    oauthId: Optional[_OAuthId]


class _Submitter(BaseModel):
    name: str
    aboutMe: str
    team: List[_SubmitterDetails]


class _ModelProcessingType(BaseModel):
    type: str


class _Schema(BaseModel):
    modelProcessingType: Optional[_ModelProcessingType]
    request: Dict[str, Any]
    response: Dict[str, Any]


class _InferenceEndPoint(BaseModel):
    class Config:
        fields = {"schema_": "schema"}

    schema_: _Schema


class _LanguagePair(BaseModel):
    sourceLanguage: str
    targetLanguage: Optional[str]


class _BenchmarkMetric(BaseModel):
    metricName: str
    score: str


class _Benchmark(BaseModel):
    benchmarkId: Optional[str]
    name: str
    description: str
    domain: str
    createdOn: Optional[datetime]
    languages: Optional[_LanguagePair]
    score: List[_BenchmarkMetric]


class Model(BaseModel):
    modelId: str
    version: str
    submittedOn: int
    updatedOn: int
    name: str
    description: str
    refUrl: str
    task: _ULCATask
    languages: List[Dict[str, Any]]
    license: str
    domain: List[str]
    inferenceEndPoint: _InferenceEndPoint
    benchmarks: Optional[List[_Benchmark]]
    submitter: _Submitter

    class Config:
        allow_population_by_field_name = True
