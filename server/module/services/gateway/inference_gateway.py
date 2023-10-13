import time
import traceback
from typing import Any, Optional

import gevent.ssl
import requests
import tritonclient.http as http_client
from custom_metrics import INFERENCE_REQUEST_COUNT, INFERENCE_REQUEST_DURATION_SECONDS
from exception.base_error import BaseError
from fastapi import Request
from fastapi.logger import logger
from numpy import block

from ..error import Errors
from ..model import Service


class InferenceGateway:
    def send_inference_request(
        self,
        request_body: Any,
        service: Service,
        request_state: Request,
        task_type: str,
    ) -> dict:
        INFERENCE_REQUEST_COUNT.labels(
            request_state.state.api_key_name,
            request_state.state.user_id,
            request_body.config.serviceId,
            task_type,
            request_body.config.language.sourceLanguage,
            request_body.config.language.dict().get("targetLanguage"),
        ).inc()

        with INFERENCE_REQUEST_DURATION_SECONDS.labels(
            request_state.state.api_key_name,
            request_state.state.user_id,
            request_body.config.serviceId,
            task_type,
            request_body.config.language.sourceLanguage,
            request_body.config.language.dict().get("targetLanguage"),
        ).time():
            try:
                response = requests.post(service.endpoint, json=request_body.dict())
            except:
                raise BaseError(Errors.DHRUVA101.value, traceback.format_exc())

            if response.status_code >= 400:
                raise BaseError(Errors.DHRUVA102.value)

            return response.json()

    def send_triton_request(
        self,
        url: str,
        headers: dict,
        model_name: str,
        input_list: list,
        output_list: list,
        request_state: Optional[Request],
        task_type: str,
        request_body: Optional[Any] = None,
    ):
        if request_body:
            INFERENCE_REQUEST_COUNT.labels(
                request_state.state.api_key_name, # type: ignore
                request_state.state.user_id, # type: ignore
                request_body.config.serviceId,
                task_type,
                request_body.config.language.sourceLanguage,
                request_body.config.language.dict().get("targetLanguage"),
            ).inc()

        begin = time.perf_counter()
        try:
            triton_client = http_client.InferenceServerClient(
                url=url,
                ssl=True,
                ssl_context_factory=gevent.ssl._create_default_https_context,  # type: ignore
                concurrency=20,
            )

            # health_ctx = triton_client.is_server_ready(headers=headers)
            # logger.info("Health ctx: {}".format(health_ctx))
            # if not health_ctx:
            #     raise BaseError(Errors.DHRUVA107.value, "Triton server is not ready")
            response = triton_client.async_infer(
                model_name,
                model_version="1",
                inputs=input_list,
                outputs=output_list,
                headers=headers,
            )
            response = response.get_result(block=True, timeout=20)

        except:
            raise BaseError(Errors.DHRUVA101.value, traceback.format_exc())

        end = time.perf_counter()
        if request_body:
            INFERENCE_REQUEST_DURATION_SECONDS.labels(
                request_state.state.api_key_name, # type: ignore
                request_state.state.user_id, # type: ignore
                request_body.config.serviceId,
                task_type,
                request_body.config.language.sourceLanguage,
                request_body.config.language.dict().get("targetLanguage"),
            ).observe(end - begin)

        return response
