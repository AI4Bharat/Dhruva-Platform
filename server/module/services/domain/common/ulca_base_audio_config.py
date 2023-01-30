from typing import Optional
from pydantic import BaseModel
from .ulca_language import _ULCALanguage


class _ULCABaseAudioConfig(BaseModel):
    language: _ULCALanguage
    audioFormat: Optional[str]
    encoding: Optional[str]
    samplingRate: Optional[int]
    postProcessors: Optional[list[str]]
