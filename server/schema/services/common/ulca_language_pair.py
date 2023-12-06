from typing import Optional

from .ulca_language import _ULCALanguage


class _ULCALanguagePair(_ULCALanguage):
    targetLanguage: str
    targetScriptCode: Optional[str] = ""
