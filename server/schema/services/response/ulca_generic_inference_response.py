from typing import Optional

from pydantic import BaseModel

from ..common import _ULCATaskType


class ULCAGenericInferenceResponse(BaseModel):
    taskType: _ULCATaskType
    config: Optional[dict]
    output: Optional[list[dict]]
    audio: Optional[list[dict]]
