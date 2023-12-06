from typing import Optional

from pydantic import BaseModel


class ULCAInferenceQuery(BaseModel):
    serviceId: Optional[str] = None
