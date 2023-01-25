from fastapi import APIRouter, Depends
from auth import ApiKeyProvider
from exception.response_models import NotAuthenticatedResponse
from ..domain.response import ULCAGenericInferenceResponse, \
    ULCAAsrInferenceResponse, ULCATranslationInferenceResponse, ULCATtsInferenceResponse
from ..service.inference_service import InferenceService
from ..domain.request import ULCAGenericInferenceRequest, ULCAAsrInferenceRequest, \
    ULCATranslationInferenceRequest, ULCATtsInferenceRequest


router = APIRouter(
    prefix="/inference",
    dependencies=[
        Depends(ApiKeyProvider),
    ],
    responses={
        "401": {"model": NotAuthenticatedResponse}
    }
)


@router.post("", response_model=ULCAGenericInferenceResponse)
async def _run_inference_generic(
    request: ULCAGenericInferenceRequest,
    inference_service: InferenceService = Depends(InferenceService)
):
    return inference_service.run_inference(request)


@router.post("/translation", response_model=ULCATranslationInferenceResponse)
async def _run_inference_translation(
    request: ULCATranslationInferenceRequest,
    inference_service: InferenceService = Depends(InferenceService)
):
    return inference_service.run_inference(request)


@router.post("/asr", response_model=ULCAAsrInferenceResponse)
async def _run_inference_asr(
    request: ULCAAsrInferenceRequest,
    inference_service: InferenceService = Depends(InferenceService)
):
    return await inference_service.run_asr_triton_inference(request)


@router.post("/tts", response_model=ULCATtsInferenceResponse)
async def _run_inference_tts(
    request: ULCATtsInferenceRequest,
    inference_service: InferenceService = Depends(InferenceService)
):
    return inference_service.run_inference(request)
