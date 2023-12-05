from urllib.request import urlopen


from fastapi import Depends

from ..gateway import InferenceGateway
from .triton_utils_service import TritonUtilsService



class ImageService:
    def __init__(
        self,
        inference_gateway: InferenceGateway = Depends(InferenceGateway),
        triton_utils_service: TritonUtilsService = Depends(TritonUtilsService),
    ):
        self.inference_gateway = inference_gateway
        self.triton_utils_service = triton_utils_service

    def download_image(self, url: str):
        
        file_bytes = urlopen(url).read()

        return file_bytes