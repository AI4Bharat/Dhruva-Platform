import re
from typing import Optional

from pydantic import BaseModel, validator

from ..common.api_key_type import ApiKeyType


class CreateApiKeyRequest(BaseModel):
    name: str
    type: ApiKeyType = ApiKeyType.INFERENCE
    regenerate: bool = False
    target_user_id: Optional[str] = None
    data_tracking: bool

    @validator("name")
    def check_api_key_name_format(cls, v):
        name_regex = r"^[a-z0-9\.\-@_\/]+$"
        if not re.search(name_regex, v):
            raise ValueError("Name has invalid characters")
        return v
