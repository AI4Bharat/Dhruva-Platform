from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from auth.auth_provider import AuthProvider
from auth.role_authorization_provider import RoleAuthorizationProvider
from exception.client_error import ClientErrorResponse
from fastapi import APIRouter, Depends
from schema.auth.common import ApiKeyType, RoleType
from schema.auth.response import GetAllApiKeysDetailsResponse
from schema.services.request import (
    ModelCreateRequest,
    ModelUpdateRequest,
    ServiceCreateRequest,
    ServiceHeartbeatRequest,
    ServiceUpdateRequest,
)
from schema.services.request.admin_dashboard import ViewAdminDashboardRequest

from ..service import AdminService

router = APIRouter(
    prefix="/admin",
    dependencies=[
        Depends(AuthProvider),
        Depends(RoleAuthorizationProvider([RoleType.ADMIN])),
        Depends(ApiKeyTypeAuthorizationProvider(ApiKeyType.PLATFORM)),
    ],
    responses={
        "401": {"model": ClientErrorResponse},
        "403": {"model": ClientErrorResponse},
    },
)


@router.get("/dashboard")
async def _view_admin_dashboard(
    request: ViewAdminDashboardRequest = Depends(),
    admin_service: AdminService = Depends(AdminService),
) -> GetAllApiKeysDetailsResponse:
    return admin_service.view_dashboard(
        request.page, request.limit, request.target_user_id
    )


@router.post("/create/service")
async def _create_service(
    request: ServiceCreateRequest, admin_service: AdminService = Depends(AdminService)
):
    return admin_service.create_service(request)


@router.post("/create/model")
async def _create_model(
    request: ModelCreateRequest, admin_service: AdminService = Depends(AdminService)
):
    return admin_service.create_model(request)


@router.patch("/update/service")
async def _update_service(
    request: ServiceUpdateRequest, admin_service: AdminService = Depends(AdminService)
):
    return admin_service.update_service(request)


@router.patch("/update/model")
async def _update_model(
    request: ModelUpdateRequest, admin_service: AdminService = Depends(AdminService)
):
    return admin_service.update_model(request)


@router.delete("/delete/service")
async def _delete_service(id: str, admin_service: AdminService = Depends(AdminService)):
    return admin_service.delete_service(id)


@router.delete("/delete/model")
async def _delete_model(id: str, admin_service: AdminService = Depends(AdminService)):
    return admin_service.delete_model(id)


@router.patch("/health")
def _update_service_health(
    request: ServiceHeartbeatRequest,
    admin_service: AdminService = Depends(AdminService),
):
    return admin_service.inference_service_status(request)
