from pydantic import BaseModel

from .ulca_base_inference_request_config import _ULCABaseInferenceRequestConfig
from .ulca_language_pair import _ULCALanguagePair


class _ULCAOcrInferenceConfig(_ULCABaseInferenceRequestConfig):
    language: _ULCALanguagePair
    
