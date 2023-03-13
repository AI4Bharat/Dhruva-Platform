import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from auth.auth_provider import AuthProvider
from exception.base_error import BaseError
from exception.http_error import HttpErrorResponse
from schema.auth.request import (
    CreateUserRequest,
    GetUserQuery,
    RefreshRequest,
    SignInRequest,
)
from schema.auth.response import GetUserResponse, RefreshResponse, SignInResponse

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
