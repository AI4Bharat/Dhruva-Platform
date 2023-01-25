from typing import Optional

from pydantic import BaseModel

class _ErrorDetail(BaseModel):
    kind: str
    message: str


class BaseErrorResponse(BaseModel):
    detail: _ErrorDetail
