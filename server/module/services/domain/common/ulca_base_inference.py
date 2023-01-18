from pydantic import BaseModel


class _ULCABaseInferenceRequest(BaseModel):
    serviceId: str
