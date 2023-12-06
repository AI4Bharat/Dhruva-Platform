from typing import List, Optional

from ..common import Gender, _ULCABaseAudioConfig, _ULCALanguagePair
from ..common.ulca_audio import _ULCAAudio
from ..common.ulca_base_inference_request import _ULCABaseInferenceRequest


class _ULCAS2SInferenceConfig(_ULCABaseAudioConfig):
    language: _ULCALanguagePair
    gender: Gender
    postProcessors: Optional[list[str]]


class ULCAS2SInferenceRequest(_ULCABaseInferenceRequest):
    audio: List[_ULCAAudio]
    config: _ULCAS2SInferenceConfig
