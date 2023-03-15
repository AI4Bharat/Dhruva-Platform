import traceback
from fastapi import Depends

from ..error.errors import Errors
from ..model import Service, ServiceCache, Model, ModelCache
from exception.base_error import BaseError
from ...auth.service.auth_service import AuthService
from ..repository import ServiceRepository, ModelRepository
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse
from schema.services.request import (
    ServiceCreateRequest, ModelCreateRequest, ServiceUpdateRequest, ModelUpdateRequest)


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
