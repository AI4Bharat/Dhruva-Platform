from typing import Dict, List

from pydantic import BaseModel

from ..common import _ULCATaskType


class _ULCATimestamp(BaseModel):
    start: float
    end: float


class _ULCATimestamps(BaseModel):
    timestamps: List[_ULCATimestamp]


class ULCAVadInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.VAD
    output: List[_ULCATimestamps]
