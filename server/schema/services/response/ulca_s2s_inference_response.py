from .ulca_tts_inference_response import ULCATtsInferenceResponse
from ..common import _ULCATextPair

class ULCAS2SInferenceResponse(ULCATtsInferenceResponse):
    output: list[_ULCATextPair]
