from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .ulca_text import _ULCAText


class _NBestToken(BaseModel):
    word: str
    tokens: List[Dict[str, float]]


class _ULCATextNBest(_ULCAText):
    nBestTokens: Optional[List[_NBestToken]] = None

    def dict(self, **kwargs) -> Dict[str, Any]:
        kwargs.update({"by_alias": True, "exclude_none": True})
        return super().dict(**kwargs)