from typing import Optional
from pydantic import BaseModel
from ..common import _ULCAAudio, _ULCABaseAudioConfig


class ULCATtsInferenceResponse(BaseModel):
    audio: list[_ULCAAudio]
    config: Optional[_ULCABaseAudioConfig]
