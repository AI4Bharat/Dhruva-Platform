from fastapi import APIRouter
from .controller import InferenceManager
from .schema import *

router = APIRouter(
    prefix="/services",
    tags=["services"],
)

inference_manager = InferenceManager()
registry = inference_manager.registry

@router.get("/list", response_model=dict)
async def _list_services():
    return registry.public_services_registry

@router.post("/view", response_model=dict)
async def _view_service_details(request: ServiceViewRequest):
    service_json = registry.public_services_registry[request.serviceId]
    service_json["model"] = registry.models_registry[service_json["modelId"]]
    return service_json

@router.post("/inference", response_model=GenericInferenceResponse_ULCA)
async def _run_inference_generic(request: GenericInferenceRequest_ULCA):
    return inference_manager.run_inference(request)

@router.post("/inference/translation", response_model=TranslationInferenceResponse_ULCA)
async def _run_inference_translation(request: TranslationInferenceRequest_ULCA):
    return inference_manager.run_inference(request)

@router.post("/inference/asr", response_model=AsrInferenceResponse_ULCA)
async def _run_inference_asr(request: AsrInferenceRequest_ULCA):
    return inference_manager.run_inference(request)

@router.post("/inference/tts", response_model=TtsInferenceResponse_ULCA)
async def _run_inference_tts(request: TtsInferenceRequest_ULCA):
    return inference_manager.run_inference(request)
