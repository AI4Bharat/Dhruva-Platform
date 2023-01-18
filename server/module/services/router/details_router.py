from typing import List
from fastapi import APIRouter, Depends

from exception.base_error import BaseError
from ..error import Errors
from ..service import DetailsService
from ..domain.response import ServiceResponse, ServiceViewResponse
from ..domain.request import ServiceViewRequest
from ..repository import ServiceRepository
import traceback


router = APIRouter(
    prefix="/details",
)


@router.get("/list_services", response_model=List[ServiceResponse])
async def _list_services(service_repository: ServiceRepository = Depends(ServiceRepository)):
    try:
        services = service_repository.find_all()
        services_list = []
        for k in services.keys():
            services_list.append(services[k])
    except:
        raise BaseError(Errors.DHRUVA103.value, traceback.format_exc())

    return services_list


@router.post("/view_service", response_model=ServiceViewResponse)
async def _view_service_details(
    request: ServiceViewRequest,
    details_service: DetailsService = Depends(DetailsService)
):
    response = details_service.get_service_details(request)
    return response
