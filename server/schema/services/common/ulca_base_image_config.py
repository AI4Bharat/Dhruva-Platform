from typing import Optional

from pydantic import BaseModel

from .image_format import ImageFormat
from .ulca_language import _ULCALanguage


class _ULCABaseImageConfig(BaseModel):
    language: _ULCALanguage
