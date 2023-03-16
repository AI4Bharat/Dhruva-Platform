from fastapi import APIRouter, Depends, status
from auth.auth_provider import AuthProvider
from exception.http_error import HttpErrorResponse
from ..service import FeedbackService
from schema.services.request import FeedbackSubmitRequest

router = APIRouter(
    prefix="/feedback",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": HttpErrorResponse}},
)


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def _submit_feedback(
    request: FeedbackSubmitRequest,
    feedback_service: FeedbackService = Depends(FeedbackService),
):
    return feedback_service.submit_feedback(request)
