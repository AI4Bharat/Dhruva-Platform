from typing import Any, Optional
from pydantic import BaseModel


class Service(BaseModel):
    _id: Optional[Any]
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    key:str
