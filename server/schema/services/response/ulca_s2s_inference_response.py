from ..common import _ULCATextPair
from .ulca_tts_inference_response import ULCATtsInferenceResponse


class ULCAS2SInferenceResponse(ULCATtsInferenceResponse):
    output: list[_ULCATextPair]
