from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, Literal

class ServiceViewRequest(BaseModel):
    serviceId: str

## Generic ULCA Schema ##

class BaseInferenceRequest_ULCA(BaseModel):
    serviceId: str

class GenericInferenceRequest_ULCA(BaseInferenceRequest_ULCA):
    config: dict
    input: Optional[list[dict]]
    audio: Optional[list[dict]]

class GenericInferenceResponse_ULCA(BaseModel):
    config: Optional[dict]
    output: Optional[list[dict]]
    audio: Optional[list[dict]]

class Language_ULCA(BaseModel):
    sourceLanguage: str

class LanguagePair_ULCA(Language_ULCA):
    targetLanguage: str

class Text_ULCA(BaseModel):
    source: str

class TextPair_ULCA(Text_ULCA):
    target: str

class Audio_ULCA(BaseModel):
    audioContent: Optional[str]
    audioUri: Optional[AnyHttpUrl]

class BaseAudioConfig_ULCA(BaseModel):
    language: Language_ULCA
    audioFormat: Optional[str]
    encoding: Optional[str]
    samplingRate: Optional[int]

## Translation Schema ##

class TranslationInferenceConfig_ULCA(BaseModel):
    language: LanguagePair_ULCA

class TranslationInferenceRequest_ULCA(BaseInferenceRequest_ULCA):
    input: list[Text_ULCA]
    config: TranslationInferenceConfig_ULCA

class TranslationInferenceResponse_ULCA(BaseModel):
    output: list[TextPair_ULCA]
    config: Optional[TranslationInferenceConfig_ULCA]

## ASR Schema ##

class AsrInferenceRequest_ULCA(BaseInferenceRequest_ULCA):
    audio: list[Audio_ULCA]
    config: BaseAudioConfig_ULCA

class AsrInferenceResponse_ULCA(BaseModel):
    output: list[Text_ULCA]
    config: Optional[BaseAudioConfig_ULCA]

## TTS Schema ##

class TtsInferenceConfig_ULCA(BaseModel):
    language: Language_ULCA
    gender: Literal['male', 'female']

class TtsInferenceRequest_ULCA(BaseInferenceRequest_ULCA):
    input: list[Text_ULCA]
    config: TtsInferenceConfig_ULCA

class TtsInferenceResponse_ULCA(BaseModel):
    audio: list[Audio_ULCA]
    config: Optional[BaseAudioConfig_ULCA]
