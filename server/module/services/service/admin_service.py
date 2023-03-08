from ..model import Service, Model
from schema.services.request import ServiceCreateRequest, ModelCreateRequest, ServiceUpdateRequest, ModelUpdateRequest
from ..repository import ServiceRepository, ModelRepository
from fastapi import Depends


class AdminService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
    ):
        self.service_repository = service_repository
        self.model_repository = model_repository

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
