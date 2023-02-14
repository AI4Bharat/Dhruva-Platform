from typing import Optional
from pydantic import BaseModel
from ..common import _ULCAText, _ULCABaseAudioConfig


class ULCAAsrInferenceResponse(BaseModel):
    output: list[_ULCAText]
    config: Optional[_ULCABaseAudioConfig]
