from enum import Enum
from typing import List, Optional

from ..common import (
    _ULCAAudio,
    _ULCABaseInferenceRequest,
    _ULCABaseInferenceRequestConfig,
)
from ..common.audio_format import AudioFormat


class _ULCAVadInferenceRequestConfig(_ULCABaseInferenceRequestConfig):
    audioFormat: AudioFormat = AudioFormat.WAV
    encoding: Optional[str] = None
    samplingRate: Optional[int] = None
    threshold: float
    minSilenceDurationMs: int
    speechPadMs: int
    minSpeechDurationMs: int = 100
    maxChunkDurationS: Optional[int] = None
    preProcessAudio: bool = True


class ULCAVadInferenceRequest(_ULCABaseInferenceRequest):
    audio: List[_ULCAAudio]
    config: _ULCAVadInferenceRequestConfig
