from fastapi import APIRouter
from exception.base_error import BaseErrorResponse
from .details_router import router as DetailsApiRouter
from .inference_router import router as InferenceApiRouter


router = APIRouter(
    prefix="/services",
    tags=["Services"],
    responses={
        "500": {"model": BaseErrorResponse}
    }
)

router.include_router(DetailsApiRouter)
router.include_router(InferenceApiRouter)
