import traceback
from typing import Any

import gevent.ssl
import requests
import tritonclient.http as http_client
from exception.base_error import BaseError
from fastapi.logger import logger
from numpy import block

from ..error import Errors
from ..model import Service


class InferenceGateway:
    def send_inference_request(
        self,
        request_body: Any,
        service: Service,
    ) -> dict:
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
    ):
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

        return response
