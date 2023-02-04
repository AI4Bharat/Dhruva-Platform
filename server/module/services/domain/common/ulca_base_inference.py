from typing import Optional
from pydantic import BaseModel


class _ULCABaseInferenceRequest(BaseModel):
    serviceId: Optional[str]
