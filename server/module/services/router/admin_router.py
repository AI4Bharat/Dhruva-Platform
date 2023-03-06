from fastapi import APIRouter, Depends
from schema.auth.request.admin_dashboard import ViewAdminDashboardRequest
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysResponse
from ..service import AdminService


router = APIRouter(
    prefix="/admin",
)


@router.get("/dashboard")
async def _view_admin_dashboard(
    request: ViewAdminDashboardRequest = Depends(),
    admin_service: AdminService = Depends(AdminService)
) -> GetAllApiKeysResponse:
    return admin_service.view_dashboard(request.page, request.limit)
