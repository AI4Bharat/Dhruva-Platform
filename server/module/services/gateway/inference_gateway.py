import traceback
from numpy import block
import requests
import gevent.ssl
from exception.base_error import BaseError
from ..error import Errors
from ..model import Service
import tritonclient.http as http_client





headers = {}
headers["Authorization"] = f""

class InferenceGateway:
    def __init__(self) -> None:
        triton_client = http_client.InferenceServerClient(
        url="aml-asr-hi-endpoint.eastus.inference.ml.azure.com",
        ssl=True,
        ssl_context_factory=gevent.ssl._create_default_https_context,
        concurrency=20
        )
        health_ctx = triton_client.is_server_ready(headers=headers)
        print("Is server ready - {}".format(health_ctx))
        self.triton_client = triton_client


    def send_inference_request(self, request_body: dict, service: Service) -> dict:
        try:
            response = requests.post(service.endpoint, json=request_body)
        except:
            raise BaseError(
                Errors.DHRUVA101.value, traceback.format_exc()
            )

        if response.status_code >= 400:
            raise BaseError(
                Errors.DHRUVA102.value
            )

        return response.json()

    async def send_triton_request(self,model_name:str,input_list:list,output_list:list):
        try:
            response = self.triton_client.async_infer(model_name, 
                        model_version="1",
                        inputs=input_list,
                        outputs=output_list,
                        headers=headers)
            response = response.get_result(block=True, timeout=4)
           
        except:
            raise BaseError(Errors.DHRUVA101.value,traceback.format_exc())
        return response

