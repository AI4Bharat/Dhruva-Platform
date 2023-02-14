from pydantic import BaseModel
from ..common import _ULCAAudio, _ULCABaseAudioConfig


class ULCAAsrInferenceRequest(BaseModel):
    audio: list[_ULCAAudio]
    config: _ULCABaseAudioConfig
