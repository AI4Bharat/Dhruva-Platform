from typing import Optional

from .base_error import BaseError


class ULCADeleteApiKeyServerError(BaseError):
    def __init__(self, error: dict[str, str], traceback: Optional[str] = None) -> None:
        self.error_kind = error["kind"]
        self.error_message = error["message"]
        self.traceback = traceback
        super().__init__(error, traceback)
