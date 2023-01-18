from typing import Optional
from ..common import _ULCABaseInferenceRequest


class ULCAGenericInferenceRequest(_ULCABaseInferenceRequest):
    config: dict
    input: Optional[list[dict]]
    audio: Optional[list[dict]]
