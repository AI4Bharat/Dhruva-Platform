from pydantic import BaseModel


class ServiceViewRequest(BaseModel):
    serviceId: str
