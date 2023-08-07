import datetime
import traceback

from exception.base_error import BaseError
from fastapi import Depends
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse
from schema.services.request import (
    ModelCreateRequest,
    ModelUpdateRequest,
    ServiceCreateRequest,
    ServiceHeartbeatRequest,
    ServiceUpdateRequest,
)

from ...auth.service.auth_service import AuthService
from ..error.errors import Errors
from ..model import Model, ModelCache, Service, ServiceCache
from ..repository import ModelRepository, ServiceRepository


class AdminService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        auth_service: AuthService = Depends(AuthService),
    ):
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.auth_service = auth_service

    def view_dashboard(self, page, limit, target_user_id):
        try:
            (
                api_keys,
                total_usage,
                total_pages,
            ) = self.auth_service.get_all_api_keys_with_usage(
                page, limit, target_user_id
            )
        except Exception:
            raise BaseError(Errors.DHRUVA109.value, traceback.format_exc())

        return GetAllApiKeysDetailsResponse(
            api_keys=api_keys,
            total_usage=total_usage,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    def create_service(self, request: ServiceCreateRequest):
        svc = request.dict()
        service = Service(**svc)
        insert_id = self.service_repository.insert_one(service)

        svc.update({"_id": insert_id})
        cache = ServiceCache(**svc)
        cache.save()
        return insert_id

    def create_model(self, request: ModelCreateRequest):
        mdl = request.dict()
        model = Model(**mdl)
        insert_id = self.model_repository.insert_one(model)

        mdl.update({"_id": insert_id})
        cache = ModelCache(**mdl)
        cache.save()
        return insert_id

    def update_service(self, request: ServiceUpdateRequest):
        cache = ServiceCache.get(request.serviceId)
        request_dict = request.dict()

        # Cache ignores all complex fields
        new_cache = cache.dict()
        for key, value in request_dict.items():
            if key in cache.__fields__ and value:
                new_cache[key] = value

        new_cache = ServiceCache(**new_cache)
        new_cache.save()

        return self.service_repository.update_one(request.dict())

    def update_model(self, request: ModelUpdateRequest):
        cache = ModelCache.get(request.modelId)
        request_dict = request.dict()

        # Cache ignores all complex fields
        new_cache = cache.dict()
        for key, value in request_dict.items():
            if key in cache.__fields__ and value:
                new_cache[key] = value

        new_cache = ModelCache(**new_cache)
        new_cache.save()

        return self.model_repository.update_one(request.dict())

    def delete_service(self, id):
        ServiceCache.delete(id)
        return self.service_repository.delete_one(id)

    def delete_model(self, id):
        ModelCache.delete(id)
        return self.model_repository.delete_one(id)

    def inference_service_status(self, request_body: ServiceHeartbeatRequest):
        try:
            service = self.service_repository.find_by_id(request_body.serviceId)
            if not service:
                raise BaseError(Errors.DHRUVA104.value)
            service = service.dict()
            if "healthStatus" not in service:
                service["healthStatus"] = {}
            service["healthStatus"]["status"] = request_body.status
            service["healthStatus"]["lastUpdated"] = str(datetime.datetime.now())
            self.service_repository.update_one(service)
            return {"message": "Service status updated successfully"}
        except:
            raise BaseError(Errors.DHRUVA113.value, traceback.format_exc())
