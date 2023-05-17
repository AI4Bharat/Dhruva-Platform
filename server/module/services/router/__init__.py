from fastapi import APIRouter, Depends

from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from exception.base_error import BaseErrorResponse
from schema.auth.common import ApiKeyType

from .admin_router import router as AdminApiRouter
from .details_router import router as DetailsApiRouter
from .feedback_router import router as FeedbackApiRouter
from .inference_router import router as InferenceApiRouter

router = APIRouter(
    prefix="/services",
    tags=["Services"],
    responses={"500": {"model": BaseErrorResponse}},
)

router.include_router(AdminApiRouter)
router.include_router(DetailsApiRouter)
router.include_router(InferenceApiRouter)
router.include_router(FeedbackApiRouter)
