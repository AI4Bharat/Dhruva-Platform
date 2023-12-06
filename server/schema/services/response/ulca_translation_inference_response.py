from typing import List, Optional

from pydantic import BaseModel

from ..common import _ULCATaskType, _ULCATextPair, _ULCATranslationInferenceConfig


class ULCATranslationInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.TRANSLATION
    output: List[_ULCATextPair]
    config: Optional[_ULCATranslationInferenceConfig] = None
