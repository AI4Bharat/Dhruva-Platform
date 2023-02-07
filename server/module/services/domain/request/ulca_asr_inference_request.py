from ..common import _ULCAAudio, _ULCABaseAudioConfig
from pydantic import BaseModel


class ULCAAsrInferenceRequest(BaseModel):
    audio: list[_ULCAAudio]
    config: _ULCABaseAudioConfig
