from typing import Union
from fastapi import APIRouter, Depends
from auth import ApiKeyProvider
from exception.response_models import NotAuthenticatedResponse
from ..domain.response import (
    ULCAGenericInferenceResponse,
    ULCAAsrInferenceResponse,
    ULCATranslationInferenceResponse,
    ULCATtsInferenceResponse,
    ULCAS2SInferenceResponse,
)
from ..service.inference_service import InferenceService
from ..domain.request import (
    ULCAGenericInferenceRequest,
    ULCAAsrInferenceRequest,
    ULCATranslationInferenceRequest,
    ULCATtsInferenceRequest,
    ULCAS2SInferenceRequest,
)


router = APIRouter(
    prefix="/inference",
    dependencies=[
        Depends(ApiKeyProvider),
    ],
    responses={"401": {"model": NotAuthenticatedResponse}},
)


@router.post("", response_model=ULCAGenericInferenceResponse)
async def _run_inference_generic(
    request: Union[
        ULCAGenericInferenceRequest, ULCAAsrInferenceRequest, ULCATranslationInferenceRequest, ULCATtsInferenceRequest
    ],
    inference_service: InferenceService = Depends(InferenceService),
):
    return await inference_service.run_inference(request)


@router.post("/translation", response_model=ULCATranslationInferenceResponse)
async def _run_inference_translation(
    request: ULCATranslationInferenceRequest, inference_service: InferenceService = Depends(InferenceService)
):
    return await inference_service.run_translation_triton_inference(request)


@router.post("/asr", response_model=ULCAAsrInferenceResponse)
async def _run_inference_asr(
    request: ULCAAsrInferenceRequest, inference_service: InferenceService = Depends(InferenceService)
):
    return await inference_service.run_asr_triton_inference(request)


@router.post("/tts", response_model=ULCATtsInferenceResponse)
async def _run_inference_tts(
    request: ULCATtsInferenceRequest, inference_service: InferenceService = Depends(InferenceService)
):
    return await inference_service.run_tts_triton_inference(request)


# Temporary endpoint; will be removed/standardized soon

@router.post("/s2s", response_model=ULCAS2SInferenceResponse)
async def _run_inference_asr(
    request: ULCAS2SInferenceRequest, inference_service: InferenceService = Depends(InferenceService)
):

    if request.config.language.sourceLanguage == "en":
        request.serviceId = "ai4bharat/conformer-en-gpu--t4"
    elif request.config.language.sourceLanguage == "hi":
        request.serviceId = "ai4bharat/conformer-hi-gpu--t4"
    elif request.config.language.sourceLanguage in {'kn', 'ml', 'ta', 'te'}:
        request.serviceId = "ai4bharat/conformer-multilingual-dravidian-gpu--t4"
    else:
        request.serviceId = "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4"

    asr_response = await inference_service.run_asr_triton_inference(request)
    asr_response = ULCAAsrInferenceResponse(**asr_response)

    translation_request = ULCATranslationInferenceRequest(
        serviceId="ai4bharat/indictrans-fairseq-all-gpu--t4",
        config=request.config,
        input=asr_response.output
    )
    translation_response = await inference_service.run_translation_triton_inference(translation_request)
    translation_response = ULCATranslationInferenceResponse(**translation_response)

    for i in range(len(translation_response.output)):
        translation_response.output[i].source, translation_response.output[i].target = translation_response.output[i].target, translation_response.output[i].source

    request.config.language.sourceLanguage = request.config.language.targetLanguage
    if request.config.language.sourceLanguage in {'kn', 'ml', 'ta', 'te'}:
        serviceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4"
    elif request.config.language.sourceLanguage in {'en', 'brx', 'mni'}:
        serviceId = "ai4bharat/indic-tts-coqui-misc-gpu--t4"
    else:
        serviceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"
    
    tts_request = ULCATtsInferenceRequest(
        serviceId=serviceId,
        config=request.config,
        input=translation_response.output
    )
    tts_response =  await inference_service.run_tts_triton_inference(tts_request)
    tts_response = ULCATtsInferenceResponse(**tts_response)

    for i in range(len(translation_response.output)):
        translation_response.output[i].source, translation_response.output[i].target = translation_response.output[i].target, translation_response.output[i].source
    
    response = ULCAS2SInferenceResponse(
        output=translation_response.output,
        audio=tts_response.audio,
        config=tts_response.config
    )

    return response
