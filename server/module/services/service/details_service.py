import traceback
from typing import List, Optional

from exception.base_error import BaseError
from fastapi import Depends, HTTPException, status
from schema.services.request import ServiceViewRequest
from schema.services.response import ServiceListResponse, ServiceViewResponse

from ..error.errors import Errors
from ..repository import ModelRepository, ServiceRepository


class DetailsService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
    ) -> None:
        self.service_repository = service_repository
        self.model_repository = model_repository

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

        return ServiceViewResponse(**service.dict(), model=model)

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
