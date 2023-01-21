from typing import Literal
from pydantic import BaseModel
from .ulca_language import _ULCALanguage


class _ULCATtsInferenceConfig(BaseModel):
    language: _ULCALanguage
    gender: Literal["male", "female"]
