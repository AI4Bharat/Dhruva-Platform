from typing import Dict, Optional

from pydantic import BaseModel


class BaseError(Exception):
    def __init__(
        self,
        error: Dict[str, str],
        traceback: Optional[str] = None,
    ) -> None:
        self.error_kind = error["kind"]
        self.error_message = error["message"]
        self.traceback = traceback
        super().__init__(error["kind"], error["message"], traceback)

    def __str__(self) -> str:
        return "{}: {}\n{}".format(self.error_kind, self.error_message, self.traceback)


class _ErrorDetail(BaseModel):
    kind: str
    message: str


class BaseErrorResponse(BaseModel):
    detail: _ErrorDetail
