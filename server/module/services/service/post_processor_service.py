import os
from typing import Dict, List, Tuple

import numpy as np
import tritonclient.http as http_client
from dotenv import load_dotenv
from fastapi import Depends, Request

from ..gateway import InferenceGateway

load_dotenv()


class PostProcessorService:
    def __init__(
        self, inference_gateway: InferenceGateway = Depends(InferenceGateway)
    ) -> None:
        self.inference_gateway = inference_gateway

    async def run_itn(
        self,
        line: str,
        language: str,
    ):
        input1 = http_client.InferInput("INPUT_TEXT", [1, 1], "BYTES")
        input1.set_data_from_numpy(
            np.asarray([line.encode("utf-8")]).astype("object").reshape([1, 1])
        )
        input2 = http_client.InferInput("LANG_ID", [1, 1], "BYTES")
        lang_id = [language]
        input2.set_data_from_numpy(np.asarray(lang_id).astype("object").reshape([1, 1]))

        inputs = [input1, input2]

        output0 = http_client.InferRequestedOutput("OUTPUT_TEXT")
        outputs = [output0]

        headers = {"Authorization": "Bearer " + os.environ["ITN_ENDPOINT_API_KEY"]}

        response = self.inference_gateway.send_triton_request(
            url=os.environ["ITN_ENDPOINT"],
            model_name="itn",
            input_list=inputs,
            output_list=outputs,
            headers=headers,
        )

        batch_result = response.as_numpy("OUTPUT_TEXT")
        if batch_result is None:
            batch_result = np.array([])

        res = " ".join([result.decode("utf8") for result in batch_result])
        return res

    async def run_punctuation(
        self,
        line: str,
        language: str,
    ):
        input1 = http_client.InferInput("INPUT_TEXT", [1, 1], "BYTES")
        input1.set_data_from_numpy(
            np.asarray([line.encode("utf-8")]).astype("object").reshape([1, 1])
        )
        input2 = http_client.InferInput("LANG_ID", [1, 1], "BYTES")
        lang_id = [language]
        input2.set_data_from_numpy(np.asarray(lang_id).astype("object").reshape([1, 1]))

        inputs = [input1, input2]

        output0 = http_client.InferRequestedOutput("OUTPUT_TEXT")
        outputs = [output0]

        headers = {"Authorization": "Bearer " + os.environ["ITN_ENDPOINT_API_KEY"]}

        response = self.inference_gateway.send_triton_request(
            url=os.environ["ITN_ENDPOINT"],
            model_name="punctuation",
            input_list=inputs,
            output_list=outputs,
            headers=headers,
        )

        batch_result = response.as_numpy("OUTPUT_TEXT")
        if batch_result is None:
            batch_result = np.array([])

        res = " ".join([result.decode("utf8") for result in batch_result])
        return res
