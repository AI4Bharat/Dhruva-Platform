from typing import List, Optional

from pydantic import BaseModel

from ..common import (
    _ULCATaskType,
    _ULCATextPairMultisuggestion,
    _ULCATransliterationInferenceConfig,
)


class ULCATransliterationInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.TRANSLITERATION
    output: List[_ULCATextPairMultisuggestion]
    config: Optional[_ULCATransliterationInferenceConfig] = None
