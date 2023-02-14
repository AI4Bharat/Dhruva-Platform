from pydantic import BaseModel
from ..common import _ULCAText, _ULCATtsInferenceConfig


class ULCATtsInferenceRequest(BaseModel):
    input: list[_ULCAText]
    config: _ULCATtsInferenceConfig
