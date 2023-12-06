from pydantic import BaseModel


class CreateApiKeyResponse(BaseModel):
    api_key: str
