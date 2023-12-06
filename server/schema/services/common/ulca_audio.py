import base64
from typing import Any, Dict, Optional
from urllib.request import urlopen

from pydantic import AnyHttpUrl, BaseModel, root_validator


class _ULCAAudio(BaseModel):
    audioContent: Optional[str] = None
    audioUri: Optional[AnyHttpUrl] = None

    # @root_validator()
    # def check_and_fetch_audio(cls, values: Dict[str, Any]):
    #     if values.get("audioContent"):
    #         return values
    #     elif values.get("audioUri"):
    #         try:
    #             values["audioContent"] = base64.b64encode(
    #                 urlopen(values["audioUri"]).read()
    #             ).decode("utf-8")
    #             return values
    #         except Exception as e:
    #             raise ValueError(
    #                 "Failed to fetch audio content from url {}".format(cls.audioUri)
    #             )
    #     else:
    #         raise ValueError("No audio provided")
