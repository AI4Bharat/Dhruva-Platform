from typing import Optional
from pydantic import BaseModel, AnyHttpUrl


class _ULCAAudio(BaseModel):
    audioContent: Optional[str]
    audioUri: Optional[AnyHttpUrl]
