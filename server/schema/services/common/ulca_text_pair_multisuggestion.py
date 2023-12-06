from typing import List

from .ulca_text import _ULCAText


class _ULCATextPairMultisuggestion(_ULCAText):
    target: List[str]
