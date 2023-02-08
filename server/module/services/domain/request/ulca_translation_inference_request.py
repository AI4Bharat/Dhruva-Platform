from pydantic import BaseModel
from ..common import _ULCAText, _ULCALanguagePair


class _ULCATranslationInferenceConfig(BaseModel):
    language: _ULCALanguagePair


class ULCATranslationInferenceRequest(BaseModel):
    input: list[_ULCAText]
    config: _ULCATranslationInferenceConfig
