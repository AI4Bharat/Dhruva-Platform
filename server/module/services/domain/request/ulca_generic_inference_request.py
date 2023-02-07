from typing import Optional
from pydantic import BaseModel


class ULCAGenericInferenceRequest(BaseModel):
    config: dict
    input: Optional[list[dict]]
    audio: Optional[list[dict]]
