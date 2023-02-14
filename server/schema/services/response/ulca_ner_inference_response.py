from pydantic import BaseModel
from typing import List, Optional
from ..common import _ULCAText

class _ULCANerTokenPrediction(BaseModel):
    token: Optional[str]
    tag: str
    tokenIndex: Optional[int]
    tokenStartIndex: int
    tokenEndIndex: int

class _ULCANerPrediction(_ULCAText):
    nerPrediction: List[_ULCANerTokenPrediction]

class ULCANerInferenceResponse(BaseModel):
    output: List[_ULCANerPrediction]
