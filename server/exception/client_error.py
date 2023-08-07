from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel


class ClientError(HTTPException):
    def __init__(
        self, status_code: int, message: str, log_exception: bool = False
    ) -> None:
        self.status_code = status_code
        self.message = message
        self.log_exception = log_exception
        super().__init__(status_code, message)


class _ErrorDetail(BaseModel):
    message: str


class ClientErrorResponse(BaseModel):
    detail: _ErrorDetail
