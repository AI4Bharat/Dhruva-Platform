from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, root_validator


class FeedbackDownloadQuery(BaseModel):
    serviceId: Optional[str]
    fromDate: int
    toDate: int

    @root_validator
    def validate_date_ranges(cls, values: Dict[str, Any]):
        if values["fromDate"] > 9999999999 or values["toDate"] > 9999999999:
            raise ValueError("UNIX Timestamp should be in seconds")

        if values["fromDate"] > values["toDate"]:
            raise ValueError("From Date should be less than equal to To Date")

        if values["toDate"] - values["fromDate"] > 604800:
            raise ValueError("Max date range should be 1 week")

        return values
