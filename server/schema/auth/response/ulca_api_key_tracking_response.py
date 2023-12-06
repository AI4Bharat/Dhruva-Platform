from enum import Enum

from pydantic import BaseModel


class ULCAApiKeyTrackingResponseStatus(Enum):
    SUCCESS = "success"
    FAILURE = "failure"


class ULCAApiKeyTrackingResponse(BaseModel):
    status: ULCAApiKeyTrackingResponseStatus
    message: str
