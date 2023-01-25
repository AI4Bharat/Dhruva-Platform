import traceback
from fastapi import Depends

from exception.base_error import BaseError
from ..domain.request.ulca_asr_inference_request import ULCAAsrInferenceRequest
from ..error.errors import Errors
from ..domain.constants import DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID, LANG_TRANS_MODEL_CODES
from ..domain.common import _ULCABaseInferenceRequest
from ..gateway import InferenceGateway
from ..repository import ServiceRepository, ModelRepository
import numpy as np
import tritonclient.http as http_client
import requests


def pad_batch(batch_data):
    batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
    max_length = max(batch_data_lens)
    batch_size = len(batch_data)

    padded_zero_array = np.zeros((batch_size, max_length),dtype=np.float32)
    for idx, data in enumerate(batch_data):
        padded_zero_array[idx,0:batch_data_lens[idx]] = data
    return padded_zero_array, np.reshape(batch_data_lens,[-1,1])


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

    async def run_asr_triton_inference(self,request_body : ULCAAsrInferenceRequest):
        # Start timer
        raw_audio = np.array(request_body.audio[0].audioContent)
        o = pad_batch(raw_audio)
        input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
        input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
        input0.set_data_from_numpy(o[0])
        input1.set_data_from_numpy(o[1].astype('int32'))
        output0 = http_client.InferRequestedOutput('TRANSCRIPTS')
        res = {
            'config': request_body.config,
            'output':[]
        }
        outputs =await self.inference_gateway.send_triton_request([input0,input1],[output0])
        for output in outputs:
            res['output'].append({'source':output})
        # End timer
        return res


    def _add_model_id_to_request(self, request_body: dict) -> None:
        lang_pair = request_body["config"]["language"]
        lang_pair = lang_pair["sourceLanguage"] + \
            '-' + lang_pair["targetLanguage"]

        request_body["config"]["modelId"] = LANG_TRANS_MODEL_CODES.get(
            lang_pair, DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID
        )
