from typing import Optional
from pydantic import BaseModel


class ULCAGenericInferenceResponse(BaseModel):
    config: Optional[dict]
    output: Optional[list[dict]]
    audio: Optional[list[dict]]
