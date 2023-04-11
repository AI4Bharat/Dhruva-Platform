import base64
import io
import time
import traceback
from copy import deepcopy
from typing import Union
from urllib.request import urlopen

import numpy as np
import requests
import scipy.signal as sps
import soundfile as sf
import tritonclient.http as http_client
from fastapi import Depends, HTTPException, status
from indictrans import Transliterator
from pydub import AudioSegment
from pydub.effects import normalize as pydub_normalize
from scipy.io import wavfile
from tritonclient.utils import np_to_triton_dtype

from celery_backend.tasks import log_data
from exception.base_error import BaseError
from schema.services.common import _ULCATaskType
from schema.services.request import (
    ULCAAsrInferenceRequest,
    ULCAGenericInferenceRequest,
    ULCANerInferenceRequest,
    ULCAPipelineInferenceRequest,
    ULCATranslationInferenceRequest,
    ULCATtsInferenceRequest,
)
from schema.services.response import (
    ULCAAsrInferenceResponse,
    ULCANerInferenceResponse,
    ULCAPipelineInferenceResponse,
    ULCATranslationInferenceResponse,
    ULCATtsInferenceResponse,
    ULCANerInferenceResponse,
    ULCAPipelineInferenceResponse,
)
from schema.services.common import (
    _ULCATaskType,
    LANG_CODE_TO_SCRIPT_CODE,
)
from ..utils.audio import webrtc_vad_chunking, silero_vad_chunking
from ..error.errors import Errors
from ..gateway import InferenceGateway
from ..model.model import ModelCache
from ..model.service import ServiceCache
from ..repository import ModelRepository, ServiceRepository

def populate_service_cache(serviceId: str, service_repository: ServiceRepository):
    service = service_repository.find_by_id(serviceId)
    service_cache = ServiceCache(**service.dict())
    service_cache.save()
    return service_cache


def populate_model_cache(modelId: str, model_repository: ModelRepository):
    model = model_repository.get_by_id(modelId)
    model_cache = ModelCache(**model.dict())
    model_cache.save()
    return model_cache


def validate_service_id(serviceId: str, service_repository):
    try:
        service = ServiceCache.get(serviceId)
    except Exception:
        try:
            service = populate_service_cache(serviceId, service_repository)
        except Exception:
            raise BaseError(Errors.DHRUVA104.value, traceback.format_exc())

    if not service:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail={"message": "Invalid service id"}
        )
    return service


def validate_model_id(modelId: str, model_repository):
    try:
        service = ModelCache.get(modelId)
    except Exception:
        try:
            service = populate_model_cache(modelId, model_repository)
        except Exception:
            raise BaseError(Errors.DHRUVA105.value, traceback.format_exc())

    if not service:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail={"message": "Invalid service id"}
        )
    return service


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
        
        service = validate_service_id(serviceId, self.service_repository)
        model = validate_model_id(service.modelId, self.model_repository)

        task_type = model.task_type
        request_body = request.dict()

        if task_type == _ULCATaskType.TRANSLATION:
            request_obj = ULCATranslationInferenceRequest(**request_body)
            return await self.run_translation_triton_inference(request_obj, serviceId)
        elif task_type == _ULCATaskType.ASR:
            request_obj = ULCAAsrInferenceRequest(**request_body)
            return await self.run_asr_triton_inference(request_obj, serviceId)
        elif task_type == _ULCATaskType.TTS:
            request_obj = ULCATtsInferenceRequest(**request_body)
            return await self.run_tts_triton_inference(request_obj, serviceId)
        elif task_type == _ULCATaskType.NER:
            request_obj = ULCANerInferenceRequest(**request_body)
            return await self.run_ner_triton_inference(request_obj, serviceId)
        else:
            # Shouldn't happen, unless the registry is not proper
            raise RuntimeError(f"Unknown task_type: {task_type}")

    async def run_asr_triton_inference(
        self, request_body: ULCAAsrInferenceRequest, serviceId: str
    ) -> ULCAAsrInferenceResponse:
        
        service = validate_service_id(serviceId, self.service_repository)
        headers = {"Authorization": "Bearer " + service.api_key}

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
            raw_audio = np.array(data)  # in float64

            # sampling_rate, raw_audio = wavfile.read(file_handle)
            if len(raw_audio.shape) > 1:  # Stereo to mono
                raw_audio = raw_audio.sum(axis=1) / 2

            standard_rate = 16000
            if sampling_rate != standard_rate:
                number_of_samples = round(
                    len(raw_audio) * float(standard_rate) / sampling_rate
                )
                raw_audio = sps.resample(raw_audio, number_of_samples)

            # Amplitude Equalization, assuming mono-streamed
            # TODO-1: Normalize based on a reference audio from MUCS benchmark? Ref: https://stackoverflow.com/a/42496373
            # TODO-2: Just implement it without pydub? Ref: https://stackoverflow.com/a/61254921
            raw_audio *= 2**15 - 1 # Quantize to int16
            pydub_audio = AudioSegment(
                data=raw_audio.astype("int16").tobytes(),
                sample_width=2,
                frame_rate=standard_rate,
                channels=1,
            )
            pydub_audio = pydub_normalize(pydub_audio)

            batch_size = 32
            chunk_size = 20
            if serviceId == "ai4bharat/whisper-medium-en--gpu--t4":
                # TODO: Specialised chunked inference for Whisper since it is unstable for long audio at high throughput
                batch_size = 1
                chunk_size = 16

            # audio_chunks = list(
            #     webrtc_vad_chunking(
            #         vad_level=3,
            #         chunk_size=chunk_size,
            #         fp_arr=pydub_audio.raw_data,
            #         sample_rate=standard_rate,
            #     )
            # )

            # Dequantize
            raw_audio = np.array(pydub_audio.get_array_of_samples()).astype('float64') / (2**15 - 1)
            audio_chunks = list(
                silero_vad_chunking(raw_audio, standard_rate, chunk_size)
            )

            output0 = http_client.InferRequestedOutput("TRANSCRIPTS")

            transcript = ''
            for i in range(0, len(audio_chunks), batch_size):
                o = self.__pad_batch(audio_chunks[i:i+batch_size])
                input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
                input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
                input0.set_data_from_numpy(o[0])
                input1.set_data_from_numpy(o[1].astype("int32"))
                input_list = [input0, input1]

                if "conformer-hi" not in serviceId and language != "en":
                    # The other endpoints are multilingual and hence have LANG_ID as extra input
                    # TODO: Standardize properly as a string similar to NMT and TTS
                    input2 = http_client.InferInput("LANG_ID", o[1].shape, "BYTES")
                    lang_id = [language]*len(o[1])
                    input2.set_data_from_numpy(np.asarray(lang_id).astype('object').reshape(o[1].shape))
                    input_list.append(input2)
                
                response = await self.inference_gateway.send_triton_request(
                    url=service.endpoint,
                    model_name="asr_am_ensemble",
                    input_list=input_list,
                    output_list=[output0],
                    headers=headers,
                )
                encoded_result = response.as_numpy("TRANSCRIPTS")
                # Combine all outputs
                outputs = " ".join(
                    [result.decode("utf-8") for result in encoded_result.tolist()]
                )
                transcript += ' ' + outputs
            res["output"].append({"source": transcript.strip()})

        return ULCAAsrInferenceResponse(**res)

    async def run_translation_triton_inference(
        self, request_body: ULCATranslationInferenceRequest, serviceId: str
    ) -> ULCATranslationInferenceResponse:
        
        service = validate_service_id(serviceId, self.service_repository)
        headers = {"Authorization": "Bearer " + service.api_key}

        results = []
        source_lang = request_body.config.language.sourceLanguage
        target_lang = request_body.config.language.targetLanguage

        # TODO: Make Triton itself accept script-code separately
        if request_body.config.language.sourceScriptCode \
            and source_lang in LANG_CODE_TO_SCRIPT_CODE \
            and request_body.config.language.sourceScriptCode != LANG_CODE_TO_SCRIPT_CODE[source_lang] \
        :
            source_lang += '_' + request_body.config.language.sourceScriptCode
        
        if request_body.config.language.targetScriptCode \
            and target_lang in LANG_CODE_TO_SCRIPT_CODE \
            and request_body.config.language.targetScriptCode != LANG_CODE_TO_SCRIPT_CODE[target_lang] \
        :
            target_lang += '_' + request_body.config.language.targetScriptCode

        for input in request_body.input:
            input_string = input.source.replace("\n", " ").strip()
            if input_string:
                inputs = [
                    self.__get_string_tensor(input_string, "INPUT_TEXT"),
                    self.__get_string_tensor(
                        source_lang, "INPUT_LANGUAGE_ID"
                    ),
                    self.__get_string_tensor(
                        target_lang, "OUTPUT_LANGUAGE_ID"
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
            else:
                result = input_string
            results.append({"source": input_string, "target": result})
        res = {
            # "config": request_body.config,
            "output": results
        }
        return ULCATranslationInferenceResponse(**res)

    async def run_tts_triton_inference(
        self, request_body: ULCATtsInferenceRequest, serviceId: str
    ) -> ULCATtsInferenceResponse:
        
        service = self.service_repository.find_by_id(serviceId)
        headers = {"Authorization": "Bearer " + service.key}

        ip_language = request_body.config.language.sourceLanguage
        ip_gender = request_body.config.gender
        target_sr = 22050
        results = []

        for input in request_body.input:
            input_string = input.source.replace('।', '.').strip()
            
            if input_string:
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
                wavfile.write(byte_io, target_sr, wav)
                encoded_bytes = base64.b64encode(byte_io.read())
                encoded_string = encoded_bytes.decode()
            else:
                encoded_string = ""
            results.append({"audioContent": encoded_string})
        
        res = {
            "config": {
                "language": {"sourceLanguage": ip_language},
                "audioFormat": "wav",
                "encoding": "base64",
                "samplingRate": target_sr,
            },
            "audio": results,
        }
        return ULCATtsInferenceResponse(**res)

    async def run_ner_triton_inference(
        self, request_body: ULCANerInferenceRequest, serviceId: str
    ) -> ULCANerInferenceResponse:
        
        service = validate_service_id(serviceId, self.service_repository)
        headers = {"Authorization": "Bearer " + service.api_key}

        # TODO: Replace with real deployments
        res = requests.post(service.endpoint, json=request_body.dict()).json()
        return ULCANerInferenceResponse(**res)

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

    def auto_select_service_id(self, task_type: str, config: dict) -> str:
        serviceId = None
        if task_type == _ULCATaskType.ASR:
            if config["language"]["sourceLanguage"] == "en":
                # serviceId = "ai4bharat/conformer-en-gpu--t4"
                serviceId = "ai4bharat/whisper-medium-en--gpu--t4"
            # elif config["language"]["sourceLanguage"] == "hi":
            #     serviceId = "ai4bharat/conformer-hi-gpu--t4"
            elif config["language"]["sourceLanguage"] in {"kn", "ml", "ta", "te"}:
                serviceId = "ai4bharat/conformer-multilingual-dravidian-gpu--t4"
            else:
                serviceId = "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4"
        # elif task_type == _ULCATaskType.TRANSLATION:
        #     # serviceId = "ai4bharat/indictrans-fairseq-all-gpu--t4"
        #     serviceId = "ai4bharat/indictrans-v2-all-gpu--t4"
        elif task_type == _ULCATaskType.TRANSLATION:
            if config["language"]["sourceLanguage"] == "en":
                serviceId = "ai4bharat/indictrans-v2-e2i-gpu--t4"
            elif config["language"]["targetLanguage"] == "en":
                serviceId = "ai4bharat/indictrans-v2-i2e-gpu--t4"
            else:
                serviceId = "ai4bharat/indictrans-v2-i2i_piv-gpu--t4"
        elif task_type == _ULCATaskType.TTS:
            if config["language"]["sourceLanguage"] in {"kn", "ml", "ta", "te"}:
                serviceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4"
            elif config["language"]["sourceLanguage"] in {"en", "brx", "mni"}:
                serviceId = "ai4bharat/indic-tts-coqui-misc-gpu--t4"
            else:
                serviceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"

        return serviceId

    async def run_pipeline_inference(
        self,
        request_body: ULCAPipelineInferenceRequest,
        request_state,  # for request state
    ) -> ULCAPipelineInferenceResponse:
        results = []

        # Check if the pipeline construction is valid
        is_pipeline_valid = True
        for i in range(len(request_body.pipelineTasks) - 1):
            current_task_type, next_task_type = (
                request_body.pipelineTasks[i].taskType,
                request_body.pipelineTasks[i + 1].taskType,
            )
            if current_task_type == _ULCATaskType.ASR:
                if next_task_type not in {_ULCATaskType.TRANSLATION}:
                    is_pipeline_valid = False
                    break
            elif current_task_type == _ULCATaskType.TRANSLATION:
                if next_task_type not in {_ULCATaskType.TTS}:
                    is_pipeline_valid = False
                    break
            else:
                is_pipeline_valid = False
                break

        if not is_pipeline_valid:
            # TODO: Return proper error messages once standardized
            return {"pipelineResponse": results}

        previous_output_json = request_body.inputData.dict()
        for pipeline_task in request_body.pipelineTasks:
            serviceId = pipeline_task.config["serviceId"] if "serviceId" in pipeline_task.config else None
            if not serviceId:
                serviceId = self.auto_select_service_id(
                    pipeline_task.taskType, pipeline_task.config
                )

            start_time = time.perf_counter()
            new_request = ULCAGenericInferenceRequest(
                config=pipeline_task.config, **previous_output_json
            )
            previous_output_json = await self.run_inference(
                request=new_request, serviceId=serviceId
            )

            log_data.apply_async(
                (
                    # Create the url for metering
                    request_state.url._url.split("/")[0]
                    + pipeline_task.taskType
                    + "?"
                    + serviceId,
                    str(request_state.state.api_key_id),
                    new_request.dict(),
                    previous_output_json.dict(),
                    time.perf_counter() - start_time,
                ),
                queue="data_log",
            )
            results.append(deepcopy(previous_output_json))

            # Output of previous will be input for next
            previous_output_json = previous_output_json.dict()
            previous_output_json.pop("config", None)
            if "output" in previous_output_json:
                previous_output_json["input"] = previous_output_json["output"]
                del previous_output_json["output"]

                if pipeline_task.taskType == _ULCATaskType.TRANSLATION:
                    # The output (target) of translation should be input (source) to next
                    for i in range(len(previous_output_json["input"])):
                        previous_output_json["input"][i][
                            "source"
                        ] = previous_output_json["input"][i]["target"]
                        del previous_output_json["input"][i]["target"]
            else:
                # This will ideally happen only for TTS, which is the final task supported *as of now*
                pass
        return {
            "pipelineResponse": results
        }
