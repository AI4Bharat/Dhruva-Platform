from pydantic import BaseModel


class ULCAApiKeyDeleteResponse(BaseModel):
    isRevoked: bool
    message: str
