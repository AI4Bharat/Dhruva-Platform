import re

from pydantic import BaseModel, EmailStr, validator


class ULCACreateApiKeyRequest(BaseModel):
    emailId: EmailStr
    appName: str
    dataTracking: bool

    @validator("appName")
    def check_api_key_name_format(cls, v):
        name_regex = r"^[a-z0-9\.\-@_]+$"
        if not re.search(name_regex, v):
            raise ValueError("Name has invalid characters")
        return v.lower()

    @validator("emailId")
    def make_email_id_lowercase(cls, v):
        return v.lower()
