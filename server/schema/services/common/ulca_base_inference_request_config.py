from typing import Any, Dict

from pydantic import BaseModel


class _ULCABaseInferenceRequestConfig(BaseModel):
    serviceId: str = ""

    def dict(self, **kwargs) -> Dict[str, Any]:
        kwargs.update({"exclude_none": True})
        return super().dict(**kwargs)

    class Config:
        extra = "allow"
