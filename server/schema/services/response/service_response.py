from pydantic import BaseModel


class ServiceResponse(BaseModel):
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
