from ..model import Service, Model
from schema.services.request import ServiceCreateRequest, ModelCreateRequest, ServiceUpdateRequest
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
        service = self.service_repository.find_by_id(request.id)
        if service is None:
            return None
        # service = Service(**request.dict())
        # return self.service_repository.update_one(service)

    def delete_service(self, id):
        # TODO: Make this typed properly
        return self.service_repository.delete_one(id)

    def delete_model(self, id):
        return self.model_repository.delete_one(id)