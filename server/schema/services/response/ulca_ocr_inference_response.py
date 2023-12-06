from typing import List, Optional

from pydantic import BaseModel

from ..common import _ULCATextPair, _ULCATaskType
from ..common import _ULCABaseImageConfig



class ULCAOcrInferenceResponse(BaseModel):
    taskType: _ULCATaskType = _ULCATaskType.OCR
    output: List[_ULCATextPair]
    config: Optional[_ULCABaseImageConfig] = None
