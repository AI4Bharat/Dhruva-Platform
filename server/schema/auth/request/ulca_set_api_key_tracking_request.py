from pydantic import BaseModel, EmailStr, validator


class ULCASetApiKeyTrackingRequest(BaseModel):
    emailId: EmailStr
    appName: str
    dataTracking: bool

    @validator("emailId")
    def make_email_id_lowercase(cls, v):
        return v.lower()

    @validator("appName")
    def make_app_name_lowercase(cls, v):
        return v.lower()
