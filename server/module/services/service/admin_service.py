import traceback
from fastapi import Depends
from exception.base_error import BaseError

from ...auth.service.auth_service import AuthService
from ..error.errors import Errors
from ..repository import ServiceRepository, ModelRepository
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysDetailsResponse


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
