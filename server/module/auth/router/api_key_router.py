from bson import ObjectId
from fastapi import APIRouter, Depends

from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.response_models import NotAuthenticatedResponse
from schema.auth.request import (
    CreateApiKeyRequest,
    GetApiKeyQuery,
    SetApiKeyStatusQuery,
)
from schema.auth.response import (
    CreateApiKeyResponse,
    GetAllApiKeysResponse,
    GetApiKeyResponse,
)

from ..service.auth_service import AuthService

router = APIRouter(
    prefix="/api-key",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": NotAuthenticatedResponse}},
)


@router.get("/all", response_model=GetAllApiKeysResponse)
async def _get_all_api_keys_for_user(
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_keys = auth_service.get_all_api_keys(request_session.id)
    return GetAllApiKeysResponse(api_keys=api_keys)  # type:ignore


@router.post("", response_model=CreateApiKeyResponse, status_code=201)
async def _create_api_key(
    request: CreateApiKeyRequest,
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.create_api_key(request, request_session.id)  # type: ignore
    return CreateApiKeyResponse(api_key=api_key)


@router.get("", response_model=GetApiKeyResponse)
async def _get_api_key(
    params: GetApiKeyQuery = Depends(GetApiKeyQuery),
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.get_api_key(ObjectId(params.api_key_id), request_session.id)
    return api_key


@router.patch("/set-status", response_model=GetApiKeyResponse)
async def _set_api_key_status(
    params: SetApiKeyStatusQuery = Depends(SetApiKeyStatusQuery),
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.set_api_key_status(params, request_session.id)
    return api_key
