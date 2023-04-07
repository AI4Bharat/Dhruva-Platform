import copy
import os
import traceback
from typing import List, Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from pydantic import AnyHttpUrl, parse_obj_as

from exception.base_error import BaseError
from module.auth.repository.api_key_repository import ApiKeyRepository
from schema.services.request import CreateSnapshotRequest, ServiceViewRequest
from schema.services.response import ServiceListResponse, ServiceViewResponse

from ..error.errors import Errors
from ..gateway import GrafanaGateway
from ..repository import ModelRepository, ServiceRepository


class DetailsService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        api_key_repository: ApiKeyRepository = Depends(ApiKeyRepository),
        grafana_gateway: GrafanaGateway = Depends(GrafanaGateway),
    ) -> None:
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.api_key_repository = api_key_repository
        self.grafana_gateway = grafana_gateway

    def get_service_details(
        self, request: ServiceViewRequest, user_id: ObjectId
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
            # Sending all services in the response temporariliy
            # TODO: convert the find result object to dict and create a new copy
            total_usage = 0
            api_keys = self.api_key_repository.find({"user_id": user_id})
            for key in api_keys:
                if getattr(key, "services"):
                    for srv in key.services:
                        if srv.service_id == request.serviceId:
                            total_usage += srv.usage
                            break

        except Exception:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

        return ServiceViewResponse(
            **service.dict(), model=model.dict(), key_usage=api_keys, total_usage=total_usage
        )

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

    def get_grafana_snapshot(self, request: CreateSnapshotRequest):
        service_specific_snapshot_path = (
            "/".join(
                os.path.dirname(os.path.realpath(__file__))
                .replace("\\", "/")
                .split("/")[:-3]
            )
            + "/grafana_snapshot/service_specific_snapshot.json"
        )

        with open(service_specific_snapshot_path, "r") as fhand:
            service_specific_snapshot = fhand.read()

        service_specific_snapshot = (
            service_specific_snapshot.replace("$USER_ID", request.user_id)
            .replace("$INFERENCE_SERVICE_ID", request.inference_service_id)
            .replace("$API_KEY_NAME", request.api_key_name)
        )

        response = self.grafana_gateway.create_grafana_snapshot(
            service_specific_snapshot
        )
        response.url = parse_obj_as(AnyHttpUrl, str(response.url) + "?kiosk=tv")

        return response
