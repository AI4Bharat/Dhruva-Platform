from typing import List

from ..common import _ULCATask
from .service_response import ServiceResponse


class ServiceListResponse(ServiceResponse):
    task: _ULCATask
    languages: List[dict]
