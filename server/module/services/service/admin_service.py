import traceback
from fastapi import Depends
from ..model import Service, Model
from exception.base_error import BaseError
from ..error.errors import Errors
from ..repository import ServiceRepository, ModelRepository
from module.auth.service.api_key_service import ApiKeyService
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysResponse


class AdminService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        api_key_service: ApiKeyService =  Depends(ApiKeyService)
    ):
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.api_key_service = api_key_service

    def view_dashboard(self, page, limit):
        try:
            api_keys, total_usage, total_pages = self.api_key_service.get_all_api_key_details(page, limit)
            return GetAllApiKeysResponse(
                api_keys=api_keys,
                total_usage=total_usage,
                page=page,
                limit=limit,
                total_pages=total_pages
            )
        except Exception:
            raise BaseError(Errors.DHRUVA109.value, traceback.format_exc())
