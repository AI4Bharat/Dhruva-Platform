from module.services.model import Model
from .service_response import ServiceResponse
from typing import Any, List, Optional
from pydantic import BaseModel

class _Task(BaseModel):
    type: str

class ServiceViewResponse(ServiceResponse):
    model: Model

class ServiceListResponse(ServiceResponse):
    task: _Task
    languages: List[dict]
