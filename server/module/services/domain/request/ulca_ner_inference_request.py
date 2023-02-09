from pydantic import BaseModel
from ..common import _ULCAText, _ULCABaseMonolingualTaskConfig

class ULCANerInferenceRequest(BaseModel):
    input: list[_ULCAText]
    config: _ULCABaseMonolingualTaskConfig
