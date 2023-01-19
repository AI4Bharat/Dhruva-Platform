from ..common import _ULCABaseInferenceRequest, _ULCAAudio, _ULCABaseAudioConfig


class ULCAAsrInferenceRequest(_ULCABaseInferenceRequest):
    audio: list[_ULCAAudio]
    config: _ULCABaseAudioConfig
