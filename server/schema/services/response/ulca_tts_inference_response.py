from typing import List, Optional

from pydantic import BaseModel

from ..common import _ULCAAudio, _ULCABaseAudioConfig, _ULCATaskType


class ULCATtsInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.TTS
    audio: List[_ULCAAudio]
    config: Optional[_ULCABaseAudioConfig]
