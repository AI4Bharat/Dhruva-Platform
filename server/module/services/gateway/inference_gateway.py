import traceback
import requests
from exception.base_error import BaseError
from ..error import Errors
from ..model import Service


class InferenceGateway:
    def send_inference_request(self, request_body: dict, service: Service) -> dict:
        try:
            response = requests.post(service.endpoint, json=request_body)
        except Exception:
            raise BaseError(Errors.DHRUVA101.value, traceback.format_exc())

        if response.status_code >= 400:
            raise BaseError(Errors.DHRUVA102.value)

        return response.json()
