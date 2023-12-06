import base64
from typing import Any, Dict, Optional
from urllib.request import urlopen

from pydantic import AnyHttpUrl, BaseModel, root_validator


class _ULCAImage(BaseModel):
    imageContent: Optional[str] = None
    imageUri: Optional[AnyHttpUrl] = None