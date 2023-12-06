from typing import List, Optional

from pydantic import BaseModel

from schema.services.common.ulca_task import _ULCATask

from ..common.dhruva_model import _Benchmark, _InferenceEndPoint, _Submitter


class ModelUpdateRequest(BaseModel):
    modelId: str
    name: Optional[str]
    description: Optional[str]
    refUrl: Optional[str]
    task: Optional[_ULCATask]
    languages: Optional[List[dict]]
    license: Optional[str]
    domain: Optional[List[str]]
    inferenceEndPoint: Optional[_InferenceEndPoint]
    benchmarks: Optional[List[_Benchmark]]
    submitter: Optional[_Submitter]
