from pydantic import BaseModel


class ULCAInferenceQuery(BaseModel):
    serviceId: str
