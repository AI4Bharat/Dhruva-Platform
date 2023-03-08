from fastapi import APIRouter, Depends
from schema.services.request import ServiceCreateRequest, ModelCreateRequest, ModelUpdateRequest, ServiceUpdateRequest

from ..service import AdminService


router = APIRouter(
    prefix="/admin",
)


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
