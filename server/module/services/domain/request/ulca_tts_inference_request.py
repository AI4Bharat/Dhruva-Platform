from ..common import _ULCAText, _ULCATtsInferenceConfig
from pydantic import BaseModel


class ULCATtsInferenceRequest(BaseModel):
    input: list[_ULCAText]
    config: _ULCATtsInferenceConfig
