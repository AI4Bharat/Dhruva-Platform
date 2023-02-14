from typing import Optional
from pydantic import BaseModel
from ..common import _ULCATextPair, _ULCATranslationInferenceConfig


class ULCATranslationInferenceResponse(BaseModel):
    output: list[_ULCATextPair]
    config: Optional[_ULCATranslationInferenceConfig]
