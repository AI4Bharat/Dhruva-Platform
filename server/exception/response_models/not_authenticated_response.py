from typing import Optional
from pydantic import BaseModel


class _ErrorDetail(BaseModel):
    message: str


class NotAuthenticatedResponse(BaseModel):
    detail: _ErrorDetail
