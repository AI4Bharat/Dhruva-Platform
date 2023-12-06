from typing import Optional

from pydantic import BaseModel, validator


class GetApiKeyQuery(BaseModel):
    api_key_name: str
    target_user_id: Optional[str]

    @validator("api_key_name")
    def lower_api_key_name_case(cls, v):
        return v.lower()
