from typing import Any, List, Optional
from pydantic import BaseModel


class _Task(BaseModel):
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
        fields = {
            'schema_': 'schema'
        }
    schema_: _Schema


class _Dataset(BaseModel):
    name: str
    values: dict[str, Any]
    meta: Optional[dict[str, Any]]


class _Benchmarks(BaseModel):
    metric: str
    datasets: List[_Dataset]


class Model(BaseModel):
    _id: Optional[Any]
    modelId: str
    version: str
    submittedOn: int
    updatedOn: int
    name: str
    description: str
    refUrl: str
    task: _Task
    languages: List[dict]
    license: str
    domain: List[str]
    inferenceEndPoint: _InferenceEndPoint
    benchmarks: Optional[List[_Benchmarks]]
    submitter: _Submitter
