from typing import Optional

from pydantic import BaseModel

from .audio_format import AudioFormat
from .ulca_language import _ULCALanguage


class _ULCABaseAudioConfig(BaseModel):
    audioFormat: AudioFormat = AudioFormat.WAV
    language: _ULCALanguage
    encoding: Optional[str]
    samplingRate: Optional[int]
