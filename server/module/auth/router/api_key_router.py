from typing import Union

from fastapi import APIRouter, Depends

from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.client_error import ClientErrorResponse
from schema.auth.request import (
    CreateApiKeyRequest,
    GetAllApiKeysRequest,
    GetApiKeyQuery,
    ModifyApiKeyParamsQuery,
    ULCACreateApiKeyRequest,
    ULCADeleteApiKeyRequest,
    ULCASetApiKeyTrackingRequest,
)
from schema.auth.request.create_api_key_request import ApiKeyType
from schema.auth.response import (
    CreateApiKeyResponse,
    GetAllApiKeysResponse,
    GetApiKeyResponse,
    GetServiceLevelApiKeysResponse,
    ULCAApiKeyDeleteResponse,
    ULCAApiKeyGenerationResponse,
    ULCAApiKeyTrackingResponse,
)

from ..service.auth_service import AuthService

router = APIRouter(
    prefix="/api-key",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": ClientErrorResponse}},
)


@router.get(
    "/list", response_model=Union[GetAllApiKeysResponse, GetServiceLevelApiKeysResponse]
)
async def _get_all_api_keys_for_user(
    params: GetAllApiKeysRequest = Depends(GetAllApiKeysRequest),
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_keys_response = auth_service.get_all_api_keys(params, request_session.id)
    return api_keys_response


@router.post("", response_model=CreateApiKeyResponse, status_code=201)
async def _create_api_key(
    request: CreateApiKeyRequest,
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.create_api_key(request, request_session.id)
    return CreateApiKeyResponse(api_key=api_key)


@router.get("", response_model=GetApiKeyResponse)
async def _get_api_key(
    params: GetApiKeyQuery = Depends(GetApiKeyQuery),
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.get_api_key(params, request_session.id)
    return api_key.dict()


@router.patch("/modify", response_model=GetApiKeyResponse)
async def _modify_api_key(
    params: ModifyApiKeyParamsQuery = Depends(ModifyApiKeyParamsQuery),
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    api_key = auth_service.modify_api_key(params, request_session.id)
    return api_key


@router.post(
    "/ulca",
    response_model=ULCAApiKeyGenerationResponse,
    status_code=201,
    include_in_schema=False,
)
async def _create_ulca_api_key(
    request: ULCACreateApiKeyRequest,
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    create_api_key_req = CreateApiKeyRequest(
        name=(request.emailId + "/" + request.appName),
        type=ApiKeyType.INFERENCE,
        regenerate=True,
        data_tracking=request.dataTracking,
    )
    api_key = auth_service.create_api_key(create_api_key_req, request_session.id)
    return ULCAApiKeyGenerationResponse(value=api_key)


@router.delete(
    "/ulca",
    response_model=ULCAApiKeyDeleteResponse,
    responses={
        "500": {"model": ULCAApiKeyDeleteResponse},
        "404": {"model": ULCAApiKeyDeleteResponse},
    },
    include_in_schema=False,
)
async def _delete_ulca_api_key(
    request: ULCADeleteApiKeyRequest,
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    res = auth_service.set_api_key_status_ulca(request, request_session.id)
    return res


@router.patch(
    "/ulca",
    response_model=ULCAApiKeyTrackingResponse,
    responses={
        "500": {"model": ULCAApiKeyTrackingResponse},
        "404": {"model": ULCAApiKeyTrackingResponse},
    },
    include_in_schema=False,
)
async def _set_ulca_api_key_tracking(
    request: ULCASetApiKeyTrackingRequest,
    auth_service: AuthService = Depends(AuthService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    res = auth_service.set_api_key_tracking_ulca(request, request_session.id)
    return res
