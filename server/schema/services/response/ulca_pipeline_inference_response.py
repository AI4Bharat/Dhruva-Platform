from pydantic import BaseModel

from .ulca_generic_inference_response import ULCAGenericInferenceResponse


class ULCAPipelineInferenceResponse(BaseModel):
    pipelineResponse: list[ULCAGenericInferenceResponse]
