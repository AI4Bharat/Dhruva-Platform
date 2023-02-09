from pydantic import BaseModel
from .ulca_language_pair import _ULCALanguagePair


class _ULCATranslationInferenceConfig(BaseModel):
    language: _ULCALanguagePair
