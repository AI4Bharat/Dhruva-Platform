from fastapi import APIRouter, Depends, status

from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.http_error import HttpErrorResponse
from schema.auth.common import ApiKeyType
from schema.services.request import ULCAFeedbackRequest

from ..service import FeedbackService

router = APIRouter(
    prefix="/feedback",
    dependencies=[
        Depends(AuthProvider),
        Depends(ApiKeyTypeAuthorizationProvider(ApiKeyType.INFERENCE)),
    ],
    responses={"401": {"model": HttpErrorResponse}},
)


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def _submit_feedback(
    request: ULCAFeedbackRequest,
    feedback_service: FeedbackService = Depends(FeedbackService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    return feedback_service.submit_feedback(request, request_session.id)
