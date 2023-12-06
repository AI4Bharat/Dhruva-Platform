from pydantic import BaseModel


class ServiceHeartbeatRequest(BaseModel):
    serviceId: str
    status: str
