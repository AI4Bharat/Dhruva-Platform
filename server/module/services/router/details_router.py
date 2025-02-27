import traceback
from typing import List

from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.base_error import BaseError
from exception.client_error import ClientError, ClientErrorResponse
from fastapi import APIRouter, Depends, status
from schema.auth.common import ApiKeyType
from schema.services.request import ModelViewRequest, ServiceViewRequest
from schema.services.response import (
    ModelViewResponse,
    ServiceListResponse,
    ServiceViewResponse,
)

from ..error import Errors
from ..repository import ModelRepository
from ..service import DetailsService

router = APIRouter(
    prefix="/details",
    dependencies=[
        Depends(AuthProvider),
        Depends(ApiKeyTypeAuthorizationProvider(ApiKeyType.INFERENCE)),
    ],
    responses={"401": {"model": ClientErrorResponse}},
)


@router.get("/list_services", response_model=List[ServiceListResponse])
async def _list_services(
    details_service: DetailsService = Depends(DetailsService),
):
    services_list = details_service.list_services()
    return services_list


@router.post("/view_service", response_model=ServiceViewResponse)
async def _view_service_details(
    request: ServiceViewRequest,
    details_service: DetailsService = Depends(DetailsService),
    session: RequestSession = Depends(InjectRequestSession),
):
    response = details_service.get_service_details(request, session.id)
    return response


@router.get("/list_models", response_model=List[ModelViewResponse])
async def _list_models(model_repository: ModelRepository = Depends(ModelRepository)):
    try:
        models_list = model_repository.find_all()
    except Exception:
        raise BaseError(Errors.DHRUVA106.value, traceback.format_exc())

    return models_list


@router.post("/view_model", response_model=ModelViewResponse)
async def _view_model_details(
    request: ModelViewRequest,
    model_repository: ModelRepository = Depends(ModelRepository),
):
    try:
        response = model_repository.find_by_id(request.modelId)
    except Exception:
        raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

    if not response:
        raise ClientError(status.HTTP_404_NOT_FOUND, message="Invalid Model Id")

    return response
