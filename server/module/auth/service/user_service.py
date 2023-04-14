import traceback
from typing import List

from argon2 import PasswordHasher
from bson import ObjectId
from fastapi import Depends, HTTPException, status

from exception.base_error import BaseError
from schema.auth.request import CreateUserRequest
from schema.auth.response.get_user_response import GetUserResponse

from ..error.errors import Errors
from ..model.user import User
from ..repository import UserRepository
from .auth_service import AuthService
from schema.auth.request import (
    CreateApiKeyRequest)
from schema.auth.common import ApiKeyType
class UserService:
    def __init__(
        self,
        user_repository: UserRepository = Depends(UserRepository),
        auth_service: AuthService = Depends(AuthService),
    ) -> None:
        self.user_repository = user_repository
        self.auth_service = auth_service

    def create_user(self, request: CreateUserRequest):
        existing_user = self.user_repository.find_one({"email": request.email})

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "User already exists"},
            )

        ph = PasswordHasher()

        hashed_password = ph.hash(request.password)

        new_user = User(
            name=request.name,
            email=request.email,
            password=hashed_password,
            role=request.role,
        )

        try:
            id = self.user_repository.insert_one(new_user)
        except Exception:
            raise BaseError(Errors.DHRUVA207.value, traceback.format_exc())

        try:
            created_user = self.user_repository.get_by_id(ObjectId(str(id)))
        except Exception:
            raise BaseError(Errors.DHRUVA206.value, traceback.format_exc())
        try:
            api_request = CreateApiKeyRequest(
                name="default",
                type=ApiKeyType.INFERENCE,
                regenerate=False,
                target_user_id=str(created_user.id)
            )
            self.auth_service.create_api_key(
                request=api_request,
                id=ObjectId(str(created_user.id)),
            )
        except Exception:
            raise BaseError(Errors.DHRUVA207.value, traceback.format_exc())
        return created_user

    def list_users(self):
        try:
            users = self.user_repository.find({})
        except Exception:
            raise BaseError(Errors.DHRUVA206.value, traceback.format_exc())
        return users