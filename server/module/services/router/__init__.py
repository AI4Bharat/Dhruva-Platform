from fastapi import APIRouter

from exception.base_error import BaseErrorResponse

from .admin_router import router as AdminApiRouter
from .details_router import router as DetailsApiRouter
from .inference_router import router as InferenceApiRouter
from .feedback_router import router as FeedbackApiRouter

router = APIRouter(
    prefix="/services",
    tags=["Services"],
    responses={"500": {"model": BaseErrorResponse}},
)

router.include_router(AdminApiRouter)
router.include_router(DetailsApiRouter)
router.include_router(InferenceApiRouter)
router.include_router(FeedbackApiRouter)
