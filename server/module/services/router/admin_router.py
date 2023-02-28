from fastapi import APIRouter, Depends
from schema.services.request import ServiceCreateRequest,ModelCreateRequest

from ..service import AdminService


router = APIRouter(
    prefix="/admin",
)


@router.post("/create_service")
async def _create_service(request: ServiceCreateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.create_service(request)


@router.get("/create_model")
async def _create_model(request: ModelCreateRequest, admin_service: AdminService = Depends(AdminService)):
    return admin_service.create_model(request)
