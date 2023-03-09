from ..model import Service, Model
from schema.services.request import ServiceCreateRequest, ModelCreateRequest, ServiceUpdateRequest, ModelUpdateRequest
from ..repository import ServiceRepository, ModelRepository
from fastapi import Depends
import traceback
from exception.base_error import BaseError
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse

from ...auth.service.auth_service import AuthService
from ..error.errors import Errors

class AdminService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        auth_service: AuthService = Depends(AuthService)
    ):
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.auth_service = auth_service

    def view_dashboard(self, page, limit):
        try:
            api_keys, total_usage, total_pages = self.auth_service.get_all_api_keys_with_usage(
                page, limit
            )

            return GetAllApiKeysDetailsResponse(
                api_keys=api_keys,
                total_usage=total_usage,
                page=page,
                limit=limit,
                total_pages=total_pages
            )
        except Exception:
            raise BaseError(Errors.DHRUVA109.value, traceback.format_exc())
            
    def create_service(self, request: ServiceCreateRequest):
        service = Service(**request.dict())
        return self.service_repository.insert_one(service)

    def create_model(self, request: ModelCreateRequest):
        model = Model(**request.dict())
        return self.model_repository.insert_one(model)

    def update_service(self, request: ServiceUpdateRequest):
        return self.service_repository.update_one(request.dict())

    def update_model(self, request: ModelUpdateRequest):
        return self.model_repository.update_one(request.dict())

    def delete_service(self, id):
        return self.service_repository.delete_one(id)

    def delete_model(self, id):
        return self.model_repository.delete_one(id)