from enum import Enum

from pydantic import BaseModel


class _ULCATaskType(str, Enum):
    ASR = "asr"
    OCR =  "ocr"
    TRANSLATION = "translation"
    TTS = "tts"
    TRANSLITERATION = "transliteration"
    NER = "ner"
    STS = "sts"  # TODO: Remove
    VAD = "vad"


# TODO: Depreciate soon
class _ULCATask(BaseModel):
    type: _ULCATaskType
