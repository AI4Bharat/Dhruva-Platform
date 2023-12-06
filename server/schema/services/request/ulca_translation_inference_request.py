from typing import List

from ..common import (
    _ULCABaseInferenceRequest,
    _ULCAText,
    _ULCATranslationInferenceConfig,
)


class ULCATranslationInferenceRequest(_ULCABaseInferenceRequest):
    input: List[_ULCAText]
    config: _ULCATranslationInferenceConfig
