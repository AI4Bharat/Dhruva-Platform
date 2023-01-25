from typing import Optional
from pydantic import BaseModel, AnyHttpUrl


class _ULCAAudio(BaseModel):
    audioContent: Optional[list]
    audioUri: Optional[AnyHttpUrl]
