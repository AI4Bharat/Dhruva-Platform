from pydantic import BaseModel


class RefreshResponse(BaseModel):
    token: str