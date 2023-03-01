from fastapi import APIRouter, Depends

from auth.auth_provider import AuthProvider
from auth.session_provider import InjectSession, Session
from exception.response_models import NotAuthenticatedResponse
from schema.auth.request import CreateApiKeyRequest, RefreshRequest, SignInRequest
from schema.auth.response import CreateApiKeyResponse, SignInResponse
from schema.auth.response.get_all_api_keys_response import GetAllApiKeysResponse

from ..service.auth_service import AuthService

router = APIRouter(
    prefix="/api_key",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": NotAuthenticatedResponse}},
)


@router.get("/all", response_model=GetAllApiKeysResponse)
async def _get_all_api_keys_for_user(
    auth_service: AuthService = Depends(AuthService),
    session: Session = Depends(InjectSession),
):
    api_keys = auth_service.get_all_api_keys(session.id)
    return GetAllApiKeysResponse(api_keys=api_keys)  # type:ignore


@router.post("", response_model=CreateApiKeyResponse, status_code=201)
async def _create_api_key(
    request: CreateApiKeyRequest,
    auth_service: AuthService = Depends(AuthService),
    session: Session = Depends(InjectSession),
):
    api_key = auth_service.create_api_key(request, session.id)
    return CreateApiKeyResponse(api_key=api_key)
