from pydantic import BaseModel

from .ulca_base_inference_request_config import _ULCABaseInferenceRequestConfig
from .ulca_language_pair import _ULCALanguagePair


class _ULCATransliterationInferenceConfig(_ULCABaseInferenceRequestConfig):
    language: _ULCALanguagePair
    isSentence: bool = True
    numSuggestions: int = 5
