from ..common import (
    _ULCABaseInferenceRequest,
    _ULCAText,
    _ULCATransliterationInferenceConfig,
)


class ULCATransliterationInferenceRequest(_ULCABaseInferenceRequest):
    input: list[_ULCAText]
    config: _ULCATransliterationInferenceConfig
