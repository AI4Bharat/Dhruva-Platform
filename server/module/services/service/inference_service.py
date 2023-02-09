import traceback
from typing import Union
from fastapi import Depends
from exception.base_error import BaseError
import requests
import numpy as np
import tritonclient.http as http_client
import soundfile as sf
from scipy.io import wavfile
import scipy.signal as sps
import io
import tritonclient.http as http_client
from tritonclient.utils import np_to_triton_dtype
import base64
from urllib.request import urlopen

from ..domain.request import (
    ULCAGenericInferenceRequest,
    ULCAAsrInferenceRequest,
    ULCATranslationInferenceRequest,
    ULCATtsInferenceRequest,
    ULCANerInferenceRequest,
)
from ..domain.response import (
    ULCAAsrInferenceResponse,
    ULCATranslationInferenceResponse,
    ULCATtsInferenceResponse,
    ULCANerInferenceResponse,
)
from ..error.errors import Errors
from ..gateway import InferenceGateway
from ..repository import ServiceRepository, ModelRepository

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
        serviceId: str,
    ) -> dict:
        try:
            service = self.service_repository.find_by_id(serviceId)
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
        elif task_type == "ner":
            request_obj = ULCANerInferenceRequest(**request_body)
            return await self.run_ner_triton_inference(request_obj)
        else:
            # Shouldn't happen, unless the registry is not proper
            raise RuntimeError(f"Unknown task_type: {task_type}")

    async def run_asr_triton_inference(
        self, request_body: ULCAAsrInferenceRequest, serviceId: str
    ) -> ULCAAsrInferenceResponse:

        service = self.service_repository.find_by_id(serviceId)
        headers = {"Authorization": "Bearer " + service.key}

        language = request_body.config.language.sourceLanguage
        res = {"config": request_body.config, "output": []}
        for input in request_body.audio:
            if input.audioContent is None and input.audioUri is not None:
                file_bytes = urlopen(input.audioUri).read()
            else:
                file_bytes = base64.b64decode(input.audioContent)
            
            file_handle = io.BytesIO(file_bytes)
            data, sampling_rate = sf.read(file_handle)
            data = data.tolist()
            raw_audio = np.array(data)
            
            # sampling_rate, raw_audio = wavfile.read(file_handle)
            if len(raw_audio.shape) > 1: # Stereo to mono
                raw_audio = raw_audio.sum(axis=1) / 2

            standard_rate = 16000
            if sampling_rate != standard_rate:
                number_of_samples = round(len(raw_audio) * float(standard_rate) / sampling_rate)
                raw_audio = sps.resample(raw_audio, number_of_samples)

            o = self.__pad_batch([raw_audio])
            input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
            input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
            input0.set_data_from_numpy(o[0])
            input1.set_data_from_numpy(o[1].astype("int32"))
            output0 = http_client.InferRequestedOutput("TRANSCRIPTS")
            
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
        self, request_body: ULCATranslationInferenceRequest, serviceId: str
    ) -> ULCATranslationInferenceResponse:

        service = self.service_repository.find_by_id(serviceId)
        headers = {"Authorization": "Bearer " + service.key}

        results = []
        for input in request_body.input:
            input_string = input.source.replace('\n', ' ').strip()
            inputs = [
                self.__get_string_tensor(input_string, "INPUT_TEXT"),
                self.__get_string_tensor(
                    request_body.config.language.sourceLanguage, "INPUT_LANGUAGE_ID"
                ),
                self.__get_string_tensor(
                    request_body.config.language.targetLanguage, "OUTPUT_LANGUAGE_ID"
                ),
            ]
            output0 = http_client.InferRequestedOutput("OUTPUT_TEXT")
            response = await self.inference_gateway.send_triton_request(
                url=service.endpoint,
                model_name="nmt",
                input_list=inputs,
                output_list=[output0],
                headers=headers,
            )
            encoded_result = response.as_numpy("OUTPUT_TEXT")
            result = encoded_result.tolist()[0].decode("utf-8")
            results.append({"source": input_string, "target": result})
        res = {"config": request_body.config, "output": results}
        return res

    async def run_tts_triton_inference(
        self, request_body: ULCATtsInferenceRequest, serviceId: str
    ) -> ULCATtsInferenceResponse:
        
        service = self.service_repository.find_by_id(serviceId)
        headers = {"Authorization": "Bearer " + service.key}

        results = []

        for input in request_body.input:
            input_string = input.source.replace('।', '.')
            ip_language = request_body.config.language.sourceLanguage
            ip_gender = request_body.config.gender
            inputs = [
                self.__get_string_tensor(input_string, "INPUT_TEXT"),
                self.__get_string_tensor(ip_gender, "INPUT_SPEAKER_ID"),
                self.__get_string_tensor(ip_language, "INPUT_LANGUAGE_ID"),
            ]
            output0 = http_client.InferRequestedOutput("OUTPUT_GENERATED_AUDIO")
            response = await self.inference_gateway.send_triton_request(
                url=service.endpoint,
                model_name="tts",
                input_list=inputs,
                output_list=[output0],
                headers=headers,
            )
            wav = response.as_numpy("OUTPUT_GENERATED_AUDIO")[0]
            byte_io = io.BytesIO()
            wavfile.write(byte_io, 22050, wav)
            encoded_bytes = base64.b64encode(byte_io.read())
            encoded_string = encoded_bytes.decode()
            results.append({"audioContent": encoded_string})
        res = {
            "config": {
                "language": {"sourceLanguage": ip_language},
                "audioFormat": "wav",
                "encoding": "base64",
                "samplingRate": 22050,
            },
            "audio": results,
        }
        return res
    
    async def run_ner_triton_inference(
        self, request_body: ULCANerInferenceRequest, serviceId: str
    ) -> ULCANerInferenceResponse:

        service = self.service_repository.find_by_id(serviceId)
        headers = {"Authorization": "Bearer " + service.key}

        # TODO: Replace with real deployments
        return requests.post(
            service.endpoint,
            json=request_body.dict()
        ).json()

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
        input_obj = http_client.InferInput(
            tensor_name, string_obj.shape, np_to_triton_dtype(string_obj.dtype)
        )
        input_obj.set_data_from_numpy(string_obj)
        return input_obj
