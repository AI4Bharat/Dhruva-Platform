from pydantic import BaseModel
from ..common import _ULCAText, _ULCALanguagePair, _ULCABaseInferenceRequest


class _ULCATranslationInferenceConfig(BaseModel):
    language: _ULCALanguagePair


class ULCATranslationInferenceRequest(_ULCABaseInferenceRequest):
    input: list[_ULCAText]
    config: _ULCATranslationInferenceConfig
