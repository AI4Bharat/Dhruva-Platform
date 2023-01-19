import traceback
from fastapi import Depends

from exception.base_error import BaseError
from ..error.errors import Errors
from ..domain.constants import DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID, LANG_TRANS_MODEL_CODES
from ..domain.common import _ULCABaseInferenceRequest
from ..gateway import InferenceGateway
from ..repository import ServiceRepository, ModelRepository


class InferenceService:
    def __init__(
        self,
        service_repository: ServiceRepository = Depends(ServiceRepository),
        model_repository: ModelRepository = Depends(ModelRepository),
        inference_gateway: InferenceGateway = Depends(InferenceGateway),
    ) -> None:
        self.service_repository = service_repository
        self.model_repository = model_repository
        self.inference_gateway = inference_gateway

    def run_inference(self, request: _ULCABaseInferenceRequest) -> dict:
        try:
            service = self.service_repository.find_by_id(
                request.serviceId
            )
        except:
            raise BaseError(Errors.DHRUVA104.value, traceback.format_exc())

        try:
            model = self.model_repository.find_by_id(service.modelId)
        except:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

        task_type = model.task.type
        request_body = request.dict()

        if task_type == "translation":
            # Temporary patch for NMT: Since the deployment hosts multiple models, it requires `modelId` explicitly
            self._add_model_id_to_request(request_body)

        return self.inference_gateway.send_inference_request(request_body, service)

    def _add_model_id_to_request(self, request_body: dict) -> None:
        lang_pair = request_body["config"]["language"]
        lang_pair = lang_pair["sourceLanguage"] + \
            '-' + lang_pair["targetLanguage"]

        request_body["config"]["modelId"] = LANG_TRANS_MODEL_CODES.get(
            lang_pair, DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID
        )
