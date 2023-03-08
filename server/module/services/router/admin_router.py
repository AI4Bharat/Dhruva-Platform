from fastapi import APIRouter, Depends
from schema.services.request.admin_dashboard import ViewAdminDashboardRequest
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse
from ..service import AdminService


router = APIRouter(
    prefix="/admin",
)


@router.get("/dashboard")
async def _view_admin_dashboard(
    request: ViewAdminDashboardRequest = Depends(),
    admin_service: AdminService = Depends(AdminService)
) -> GetAllApiKeysDetailsResponse:
    return admin_service.view_dashboard(request.page, request.limit)
