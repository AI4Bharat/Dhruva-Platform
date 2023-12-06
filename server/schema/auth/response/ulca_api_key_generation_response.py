from pydantic import BaseModel


class ULCAApiKeyGenerationResponse(BaseModel):
    name: str = "Authorization"
    value: str
