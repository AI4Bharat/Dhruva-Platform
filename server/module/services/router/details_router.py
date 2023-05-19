import traceback
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.base_error import BaseError
from exception.http_error import HttpErrorResponse
from schema.auth.common import ApiKeyType
from schema.services.request import (
    CreateSnapshotRequest,
    ModelViewRequest,
    ServiceViewRequest,
)
from schema.services.response import (
    CreateGrafanaSnapshotResponse,
    ServiceListResponse,
    ServiceViewResponse,
)

from ..error import Errors
from ..model import Model
from ..repository import ModelRepository
from ..service import DetailsService

router = APIRouter(
    prefix="/details",
    dependencies=[
        Depends(AuthProvider),
        Depends(ApiKeyTypeAuthorizationProvider(ApiKeyType.INFERENCE)),
    ],
    responses={"401": {"model": HttpErrorResponse}},
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


@router.post("/grafana_snapshot", response_model=CreateGrafanaSnapshotResponse)
async def _get_current_grafana_snapshot(
    request: CreateSnapshotRequest,
    details_service: DetailsService = Depends(DetailsService),
):
    response = details_service.get_grafana_snapshot(request)
    return response
