from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field, create_model
from redis_om import Field as RedisField
from schema.services.common import _ULCALanguagePair, _ULCATask
from db.MongoBaseModel import MongoBaseModel
from cache.CacheBaseModel import CacheBaseModel, generate_cache_model


class Task(BaseModel):
    type: str


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
    request: dict
    response: dict


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


class Model(MongoBaseModel):
    modelId: str
    version: str
    submittedOn: int
    updatedOn: int
    name: str
    description: str
    refUrl: str
    task: _ULCATask
    languages: List[dict]
    license: str
    domain: List[str]
    inferenceEndPoint: _InferenceEndPoint
    benchmarks: Optional[List[_Benchmark]]
    submitter: _Submitter

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


ModelCache = create_model(
    "ModelCache",
    __base__=CacheBaseModel,
    **generate_cache_model(Model, primary_key_field="modelId")
)
