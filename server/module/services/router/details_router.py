from typing import List
from fastapi import APIRouter, Depends
from exception.base_error import BaseError
from ..repository.model_repository import ModelRepository
from ..model.model import Model
from ..error import Errors
from ..service import DetailsService
from schema.services.response import ServiceListResponse, ServiceViewResponse
from schema.services.request import ServiceViewRequest, ModelViewRequest
from ..repository import ServiceRepository
import traceback


router = APIRouter(
    prefix="/details",
)


@router.get("/list_services", response_model=List[ServiceListResponse])
async def _list_services(service_repository: ServiceRepository = Depends(ServiceRepository), details_service: DetailsService = Depends(DetailsService)):
    
    services_list = details_service.list_services()
    return services_list


@router.post("/view_service", response_model=ServiceViewResponse)
async def _view_service_details(
    request: ServiceViewRequest,
    details_service: DetailsService = Depends(DetailsService)
):
    response = details_service.get_service_details(request)
    return response


@router.get("/list_models", response_model=List[Model])
async def _list_models(model_repository: ModelRepository = Depends(ModelRepository)):
    try:
        models = model_repository.find_all()
        models_list = []
        for k in models.keys():
            models_list.append(models[k])
    except:
        raise BaseError(Errors.DHRUVA106.value, traceback.format_exc())

    return models_list


@router.post("/view_model", response_model=Model)
async def _view_model_details(
    request: ModelViewRequest,
    model_repository: ModelRepository = Depends(ModelRepository)
):
    try:
        response = model_repository.find_by_id(request.modelId)
    except:
        raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

    return response
