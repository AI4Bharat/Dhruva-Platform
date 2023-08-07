from auth.api_key_type_authorization_provider import ApiKeyTypeAuthorizationProvider
from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.client_error import ClientErrorResponse
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from schema.auth.common import ApiKeyType
from schema.services.request import (
    FeedbackDownloadQuery,
    ULCAFeedbackQuestionRequest,
    ULCAFeedbackRequest,
)

from ..service import FeedbackService

router = APIRouter(
    prefix="/feedback",
    dependencies=[
        Depends(AuthProvider),
        Depends(ApiKeyTypeAuthorizationProvider(ApiKeyType.INFERENCE)),
    ],
    responses={"401": {"model": ClientErrorResponse}},
)


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def _submit_feedback(
    request: ULCAFeedbackRequest,
    feedback_service: FeedbackService = Depends(FeedbackService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    return feedback_service.submit_feedback(request, request_session.id)


@router.post("/questions")
async def _get_feedback_questions(
    request: ULCAFeedbackQuestionRequest,
    feedback_service: FeedbackService = Depends(FeedbackService),
):
    return feedback_service.fetch_questions(request)


@router.get("/export", response_class=StreamingResponse)
async def export_feedback_csv(
    params: FeedbackDownloadQuery = Depends(FeedbackDownloadQuery),
    feedback_service: FeedbackService = Depends(FeedbackService),
):
    file = feedback_service.fetch_feedback_csv(params)
    headers = {"Content-Disposition": 'attachment; filename="feedback.csv"'}

    return StreamingResponse(file, headers=headers)
