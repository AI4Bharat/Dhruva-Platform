import traceback
from typing import List, Optional

from exception.base_error import BaseError
from fastapi import Depends, HTTPException, status
from schema.services.request import ServiceViewRequest
from schema.services.response import ServiceListResponse, ServiceViewResponse

from ..error.errors import Errors
from ..repository import ModelRepository, ServiceRepository
from module.auth.repository.api_key_repository import ApiKeyRepository


class DetailsService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        api_key_repository: ApiKeyRepository =  Depends(ApiKeyRepository)
    ) -> None:
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.api_key_repository = api_key_repository

    def get_service_details(
        self, request: ServiceViewRequest
    ) -> Optional[ServiceViewResponse]:
        try:
            service = self.service_repository.find_by_id(request.serviceId)
        except:
            raise BaseError(Errors.DHRUVA104.value, traceback.format_exc())

        if not service:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        try:
            model = self.model_repository.get_by_id(service.modelId)
        except:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())
        
        try:
            api_key_details = self.api_key_repository.get_by_id(request.api_key_id)
            usage = 0
            if "services" in api_key_details:
                for srv in api_key_details["services"]:
                    if srv["service_id"] == request.serviceId:
                        usage = srv["usage"]
        except:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

        return ServiceViewResponse(**service.dict(), model=model, usage=usage)

    def list_services(self) -> List[ServiceListResponse]:
        try:
            services_list = self.service_repository.find_all()
        except:
            raise BaseError(Errors.DHRUVA103.value, traceback.format_exc())

        response_list: List[ServiceListResponse] = []
        for service in services_list:
            try:
                model = self.model_repository.get_one({"modelId": service.modelId})
            except:
                raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

            response_list.append(
                ServiceListResponse(
                    **service.dict(), task=model.task, languages=model.languages
                )
            )

        return response_list
