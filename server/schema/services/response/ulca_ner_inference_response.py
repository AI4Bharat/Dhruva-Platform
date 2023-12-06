from typing import List, Optional

from pydantic import BaseModel

from ..common import _ULCATaskType, _ULCAText


class _ULCANerTokenPrediction(BaseModel):
    token: Optional[str]
    tag: str
    tokenIndex: Optional[int]
    tokenStartIndex: int
    tokenEndIndex: int


class _ULCANerPrediction(_ULCAText):
    nerPrediction: List[_ULCANerTokenPrediction]


class ULCANerInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.NER
    output: List[_ULCANerPrediction]
