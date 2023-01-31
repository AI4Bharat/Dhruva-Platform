from module.services.model import Model
from .service_response import ServiceResponse
from typing import  List
from pydantic import BaseModel


class _Task(BaseModel):
    type: str

class ServiceListResponse(ServiceResponse):
    task: _Task
    languages: List[dict]
