import traceback
from typing import Union
from fastapi import Depends
from exception.base_error import BaseError
from ..domain.request.ulca_generic_inference_request import ULCAGenericInferenceRequest
from ..domain.request.ulca_asr_inference_request import ULCAAsrInferenceRequest
from ..domain.request.ulca_translation_inference_request import ULCATranslationInferenceRequest
from ..domain.request.ulca_tts_inference_request import ULCATtsInferenceRequest
from ..domain.response.ulca_asr_inference_response import ULCAAsrInferenceResponse
from ..domain.response.ulca_translation_inference_response import ULCATranslationInferenceResponse
from ..domain.response.ulca_tts_inference_response import ULCATtsInferenceResponse
from ..error.errors import Errors
from ..domain.constants import DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID, LANG_TRANS_MODEL_CODES
from ..domain.common import _ULCABaseInferenceRequest
from ..gateway import InferenceGateway
from ..repository import ServiceRepository, ModelRepository
import requests
import numpy as np
import tritonclient.http as http_client
from scipy.io.wavfile import write as scipy_wav_write
import io
import tritonclient.http as http_client
from tritonclient.utils import np_to_triton_dtype
import base64
import soundfile as sf
from urllib.request import urlopen

from indictrans import Transliterator
ISO_639_v2_to_v3 = {
    "as": "asm",
    "bn": "ben",
    "en": "eng",
    "gu": "guj",
    "hi": "hin",
    "kn": "kan",
    "ml": "mal",
    "mr": "mar",
    "ne": "nep",
    "or": "ori",
    "pa": "pan",
    "sa": "hin",
    "ta": "tam",
    "te": "tel",
    "ur": "urd",
}

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

    async def run_inference(
        self,
        request: Union[
            ULCAGenericInferenceRequest,
            ULCAAsrInferenceRequest,
            ULCATranslationInferenceRequest,
            ULCATtsInferenceRequest,
        ],
    ) -> dict:
        try:
            service = self.service_repository.find_by_id(request.serviceId)
        except:
            raise BaseError(Errors.DHRUVA104.value, traceback.format_exc())

        try:
            model = self.model_repository.find_by_id(service.modelId)
        except:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

        task_type = model.task.type
        request_body = request.dict()

        if task_type == "translation":
            request_obj = ULCATranslationInferenceRequest(**request_body)
            return await self.run_translation_triton_inference(request_obj)
        elif task_type == "asr":
            request_obj = ULCAAsrInferenceRequest(**request_body)
            return await self.run_asr_triton_inference(request_obj)
        elif task_type == "tts":
            request_obj = ULCATtsInferenceRequest(**request_body)
            return await self.run_tts_triton_inference(request_obj)

    async def run_asr_triton_inference(self, request_body: ULCAAsrInferenceRequest) -> ULCAAsrInferenceResponse:
        language = request_body.config.language.sourceLanguage
        res = {"config": request_body.config, "output": []}
        for input in request_body.audio:
            if input.audioContent is None and input.audioUri is not None:
                file_bytes = urlopen(input.audioUri).read()
            else:
                file_bytes = base64.b64decode(input.audioContent)
            data,_ = sf.read(io.BytesIO(file_bytes))
            data = data.tolist()
            raw_audio = np.array(data)
            o = self.__pad_batch([raw_audio])
            input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
            input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
            input0.set_data_from_numpy(o[0])
            input1.set_data_from_numpy(o[1].astype("int32"))
            output0 = http_client.InferRequestedOutput("TRANSCRIPTS")
            service = self.service_repository.find_by_id(request_body.serviceId)
            headers = {"Authorization": "Bearer " + service.key}
            response = await self.inference_gateway.send_triton_request(
                url=service.endpoint,
                model_name="asr_am_ensemble",
                input_list=[input0, input1],
                output_list=[output0],
                headers=headers,
            )
            encoded_result = response.as_numpy("TRANSCRIPTS")
            outputs = [result.decode("utf-8") for result in encoded_result.tolist()]
            for output in outputs:
                res["output"].append({"source": output})
        
        # Temporary patch
        if language in {"kn", "ml", "te"}:
            trn = Transliterator(source="tam", target=ISO_639_v2_to_v3[language])
            for i in range(len(res["output"])):
                res["output"][i]["source"] = trn.transform(res["output"][i]["source"])
        elif language in {"bn", "gu", "or", "pa", "ur"}:
            trn = Transliterator(source="hin", target=ISO_639_v2_to_v3[language])
            for i in range(len(res["output"])):
                res["output"][i]["source"] = trn.transform(res["output"][i]["source"])

        return res

    async def run_translation_triton_inference(
        self, request_body: ULCATranslationInferenceRequest
    ) -> ULCATranslationInferenceResponse:
        results = []
        for input in request_body.input:
            input_string = input.source.replace('\n', ' ').strip()
            inputs = [
                self.__get_string_tensor(input_string, "INPUT_TEXT"),
                self.__get_string_tensor(request_body.config.language.sourceLanguage, "INPUT_LANGUAGE_ID"),
                self.__get_string_tensor(request_body.config.language.targetLanguage, "OUTPUT_LANGUAGE_ID"),
            ]
            output0 = http_client.InferRequestedOutput("OUTPUT_TEXT")
            service = self.service_repository.find_by_id(request_body.serviceId)
            headers = {"Authorization": "Bearer " + service.key}
            response = await self.inference_gateway.send_triton_request(
                url=service.endpoint, model_name="nmt", input_list=inputs, output_list=[output0], headers=headers
            )
            encoded_result = response.as_numpy("OUTPUT_TEXT")
            result = encoded_result.tolist()[0].decode("utf-8")
            results.append({"source": input_string, "target": result})
        res = {"config": request_body.config, "output": results}
        return res

    async def run_tts_triton_inference(self, request_body: ULCATtsInferenceRequest) -> ULCATtsInferenceResponse:
        results = []
        for input in request_body.input:
            input_string = input.source
            ip_language = request_body.config.language.sourceLanguage
            ip_gender = request_body.config.gender
            inputs = [
                self.__get_string_tensor(input_string, "INPUT_TEXT"),
                self.__get_string_tensor(ip_gender, "INPUT_SPEAKER_ID"),
                self.__get_string_tensor(ip_language, "INPUT_LANGUAGE_ID"),
            ]
            output0 = http_client.InferRequestedOutput("OUTPUT_GENERATED_AUDIO")
            service = self.service_repository.find_by_id(request_body.serviceId)
            headers = {"Authorization": "Bearer " + service.key}
            response = await self.inference_gateway.send_triton_request(
                url=service.endpoint, model_name="tts", input_list=inputs, output_list=[output0], headers=headers
            )
            wav = response.as_numpy("OUTPUT_GENERATED_AUDIO")[0]
            byte_io = io.BytesIO()
            scipy_wav_write(byte_io, 22050, wav)
            encoded_bytes = base64.b64encode(byte_io.read())
            encoded_string = encoded_bytes.decode()
            results.append({
                "audioContent": encoded_string
            })
        res = {
            "config": {
                "language": {
                    "sourceLanguage": ip_language
                },
                "audioFormat": "wav",
                "encoding": "base64",
                "samplingRate": 22050,
            },
            "audio": results
        }
        return res

    def _add_model_id_to_request(self, request_body: dict) -> None:
        lang_pair = request_body["config"]["language"]
        lang_pair = lang_pair["sourceLanguage"] + "-" + lang_pair["targetLanguage"]

        request_body["config"]["modelId"] = LANG_TRANS_MODEL_CODES.get(lang_pair, DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID)

    def __pad_batch(self, batch_data):
        batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
        max_length = max(batch_data_lens)
        batch_size = len(batch_data)

        padded_zero_array = np.zeros((batch_size, max_length), dtype=np.float32)
        for idx, data in enumerate(batch_data):
            padded_zero_array[idx, 0 : batch_data_lens[idx]] = data
        return padded_zero_array, np.reshape(batch_data_lens, [-1, 1])

    def __get_string_tensor(self, string_value: str, tensor_name: str):
        string_obj = np.array([string_value], dtype="object")
        input_obj = http_client.InferInput(tensor_name, string_obj.shape, np_to_triton_dtype(string_obj.dtype))
        input_obj.set_data_from_numpy(string_obj)
        return input_obj
