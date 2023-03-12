from fastapi import APIRouter, Depends
from schema.services.request import ServiceCreateRequest, ModelCreateRequest, ModelUpdateRequest, ServiceUpdateRequest
from auth.auth_provider import AuthProvider
from exception.http_error import HttpErrorResponse
from schema.services.request.admin_dashboard import ViewAdminDashboardRequest
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse
from ..service import AdminService


router = APIRouter(
    prefix="/admin",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": HttpErrorResponse}}
)
@router.get("/dashboard")
async def _view_admin_dashboard(
    request: ViewAdminDashboardRequest = Depends(),
    admin_service: AdminService = Depends(AdminService)
) -> GetAllApiKeysDetailsResponse:
    return admin_service.view_dashboard(request.page, request.limit)

@router.post("/create/service")
async def _create_service(request: ServiceCreateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.create_service(request)


@router.get("/create/model")
async def _create_model(request: ModelCreateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.create_model(request)


@router.patch("/update/service")
async def _update_service(request: ServiceUpdateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.update_service(request)


@router.patch("/update/model")
async def _update_model(request: ModelUpdateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.update_model(request)


@router.delete("/delete/service")
async def _delete_service(id: str, admin_service: AdminService = Depends(AdminService)):
    return admin_service.delete_service(id)


@router.delete("/delete/model")
async def _delete_model(id: str, admin_service: AdminService = Depends(AdminService)):
    return admin_service.delete_model(id)
