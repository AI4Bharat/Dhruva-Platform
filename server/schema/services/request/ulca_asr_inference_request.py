from enum import Enum
from typing import List, Optional

from pydantic import BaseModel

from ..common import (
    _ULCAAudio,
    _ULCABaseInferenceRequest,
    _ULCABaseInferenceRequestConfig,
)
from ..common.ulca_base_audio_config import _ULCABaseAudioConfig


class ULCATextFormat(str, Enum):
    SRT = "srt"
    TRANSCRIPT = "transcript"
    WEBVTT = "webvtt"


class ULCATranscriptionFormat(BaseModel):
    value: ULCATextFormat = ULCATextFormat.TRANSCRIPT


class _ULCAAsrInferenceRequestConfig(
    _ULCABaseInferenceRequestConfig, _ULCABaseAudioConfig
):
    preProcessors: Optional[List[str]]
    postProcessors: Optional[List[str]]
    transcriptionFormat: ULCATranscriptionFormat = ULCATranscriptionFormat()
    bestTokenCount: int = 0


class ULCAAsrInferenceRequest(_ULCABaseInferenceRequest):
    audio: List[_ULCAAudio]
    config: _ULCAAsrInferenceRequestConfig
