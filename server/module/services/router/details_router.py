import traceback
from typing import List

from exception.base_error import BaseError
from fastapi import APIRouter, Depends, HTTPException, status
from schema.services.request import ModelViewRequest, ServiceViewRequest
from schema.services.response import ServiceListResponse, ServiceViewResponse

from ..error import Errors
from ..model import Model
from ..repository import ServiceRepository
from ..repository.model_repository import ModelRepository
from ..service import DetailsService

router = APIRouter(
    prefix="/details",
)


@router.get("/list_services", response_model=List[ServiceListResponse])
async def _list_services(
    service_repository: ServiceRepository = Depends(ServiceRepository),
    details_service: DetailsService = Depends(DetailsService),
):
    services_list = details_service.list_services()
    return services_list


@router.post("/view_service", response_model=ServiceViewResponse)
async def _view_service_details(
    request: ServiceViewRequest,
    details_service: DetailsService = Depends(DetailsService),
):
    response = details_service.get_service_details(request)
    return response


@router.get("/list_models", response_model=List[Model])
async def _list_models(model_repository: ModelRepository = Depends(ModelRepository)):
    try:
        models_list = model_repository.find_all()
    except:
        raise BaseError(Errors.DHRUVA106.value, traceback.format_exc())

    return models_list


@router.post("/view_model", response_model=Model)
async def _view_model_details(
    request: ModelViewRequest,
    model_repository: ModelRepository = Depends(ModelRepository),
):
    try:
        response = model_repository.find_by_id(request.modelId)
    except:
        raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

    if not response:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    return response
