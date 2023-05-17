from fastapi import APIRouter, Depends, status
from auth.auth_provider import AuthProvider
from exception.http_error import HttpErrorResponse
from auth.request_session_provider import InjectRequestSession, RequestSession
from ..service import FeedbackService
from schema.services.request import ULCAFeedbackRequest

router = APIRouter(
    prefix="/feedback",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": HttpErrorResponse}},
)


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def _submit_feedback(
    request: ULCAFeedbackRequest,
    serviceId: str,
    feedback_service: FeedbackService = Depends(FeedbackService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    return feedback_service.submit_feedback(request, request_session.id,serviceId)
