from .ulca_base_inference_request_config import _ULCABaseInferenceRequestConfig
from .ulca_language_pair import _ULCALanguagePair


class _ULCATranslationInferenceConfig(_ULCABaseInferenceRequestConfig):
    language: _ULCALanguagePair
