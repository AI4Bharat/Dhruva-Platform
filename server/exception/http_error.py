from fastapi import HTTPException
from pydantic import BaseModel


class HttpError(HTTPException):
    def __init__(self, status_code: int, message: str) -> None:
        self.status_code = status_code
        self.message = message
        super().__init__(status_code, message)


class _ErrorDetail(BaseModel):
    message: str


class HttpErrorResponse(BaseModel):
    detail: _ErrorDetail
