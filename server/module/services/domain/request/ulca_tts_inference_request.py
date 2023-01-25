from ..common import _ULCAText, _ULCABaseInferenceRequest, _ULCATtsInferenceConfig


class ULCATtsInferenceRequest(_ULCABaseInferenceRequest):
    input: list[_ULCAText]
    config: _ULCATtsInferenceConfig
