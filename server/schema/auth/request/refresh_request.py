from pydantic import BaseModel


class RefreshRequest(BaseModel):
    token: str