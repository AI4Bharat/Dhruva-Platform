import traceback
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from auth.auth_provider import AuthProvider
from auth.request_session_provider import InjectRequestSession, RequestSession
from exception.base_error import BaseError
from exception.http_error import HttpErrorResponse
from schema.auth.request import (
    CreateUserRequest,
    GetUserQuery,
    ModifyUserQuery,
    RefreshRequest,
    SignInRequest,
)
from schema.auth.response import GetUserResponse, GetUsersResponse

from ..error.errors import Errors
from ..model.user import User
from ..repository import UserRepository
from ..service.auth_service import AuthService
from ..service.user_service import UserService

router = APIRouter(
    prefix="/user",
    dependencies=[
        Depends(AuthProvider),
    ],
    responses={"401": {"model": HttpErrorResponse}},
)


@router.get("", response_model=GetUserResponse)
async def _get_user(
    params: GetUserQuery = Depends(GetUserQuery),
    user_repository: UserRepository = Depends(UserRepository),
):
    try:
        user = user_repository.find_one({"email": params.email})
    except Exception:
        raise BaseError(Errors.DHRUVA206.value, traceback.format_exc())

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail={"message": "User not found"}
        )

    return user


@router.post("", response_model=GetUserResponse, status_code=201)
async def _create_user(
    request: CreateUserRequest, user_service: UserService = Depends(UserService)
):
    user = user_service.create_user(request)
    return user


@router.get("/list", response_model=List[GetUsersResponse])
async def _list_users(
    user_service: UserService = Depends(UserService),
):
    users = user_service.list_users()
    return users


@router.patch("/modify", response_model=GetUsersResponse)
async def _modify_user(
    params: ModifyUserQuery = Depends(ModifyUserQuery),
    user_service: UserService = Depends(UserService),
    request_session: RequestSession = Depends(InjectRequestSession),
):
    user = user_service.modify_user(params, request_session.id)
    return user
