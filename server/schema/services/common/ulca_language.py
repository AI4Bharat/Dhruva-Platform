from typing import Optional

from pydantic import BaseModel


class _ULCALanguage(BaseModel):
    sourceLanguage: str
    sourceScriptCode: Optional[str] = ""
