from typing import List

from pydantic import create_model

from ..common import (
    _ULCABaseInferenceRequest,
    _ULCABaseInferenceRequestConfig,
    _ULCALanguage,
    _ULCAText,
)


class _ULCANerInferenceRequestConfig(_ULCABaseInferenceRequestConfig):
    language: _ULCALanguage


class ULCANerInferenceRequest(_ULCABaseInferenceRequest):
    input: List[_ULCAText]
    config: _ULCANerInferenceRequestConfig
