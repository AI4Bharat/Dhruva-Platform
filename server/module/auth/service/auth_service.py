import os
import secrets
import time
import traceback
from datetime import datetime
from typing import List

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from dotenv import load_dotenv
from exception.base_error import BaseError
from fastapi import Depends, HTTPException, status
from module.auth.model import Session
from pydantic import EmailStr
from schema.auth.request import CreateApiKeyRequest, RefreshRequest, SignInRequest
from schema.auth.response import SignInResponse

from ..error import Errors
from ..model.api_key import ApiKey
from ..repository import ApiKeyRepository, SessionRepository, UserRepository

load_dotenv()


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository = Depends(UserRepository),
        session_repository: SessionRepository = Depends(SessionRepository),
        api_key_repository: ApiKeyRepository = Depends(ApiKeyRepository),
    ) -> None:
        self.user_repository = user_repository
        self.session_repository = session_repository
        self.api_key_repository = api_key_repository

    def validate_user(self, request: SignInRequest):
        try:
            user = self.user_repository.find_one({"email": request.email})
        except:
            raise BaseError(Errors.DHRUVA201.value, traceback.format_exc())

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid credentials"},
            )

        ph = PasswordHasher()
        ph.check_needs_rehash(user.password)

        try:
            ph.verify(user.password, request.password)
        except VerifyMismatchError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid credentials"},
            )
        except Exception:
            raise BaseError(Errors.DHRUVA202.value, traceback.format_exc())

        session = Session(
            _id=None,
            email=user.email,
            type="refresh",
            timestamp=datetime.now(),
        )

        try:
            id = self.session_repository.insert_one(session)
        except Exception:
            raise BaseError(Errors.DHRUVA203.value, traceback.format_exc())

        token = jwt.encode(
            {
                "sub": user.email,
                "name": user.name,
                "exp": (time.time() + 31536000),
                "iat": time.time(),
                "id": str(id),
            },
            os.environ["JWT_SECRET_KEY"],
            algorithm="HS256",
            headers={"tok": "refresh"},
        )

        # create and return jwt
        return SignInResponse(email=user.email, token=token, role=user.role)

    def get_refresh_token(self, request: RefreshRequest):
        headers = jwt.get_unverified_header(request.token)
        if headers.get("tok") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Invalid refresh token"},
            )

        try:
            claims = jwt.decode(
                request.token, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Invalid refresh token"},
            )

        session = Session(
            _id=None,
            email=claims["sub"],
            type="access",
            timestamp=datetime.now(),
        )

        try:
            id = self.session_repository.insert_one(session)
        except Exception:
            raise BaseError(Errors.DHRUVA203.value, traceback.format_exc())

        token = jwt.encode(
            {
                "sub": claims["sub"],
                "name": claims["name"],
                "exp": (time.time() + 2592000),
                "iat": time.time(),
                "id": str(id),
            },
            os.environ["JWT_SECRET_KEY"],
            algorithm="HS256",
            headers={"tok": "access"},
        )

        return token

    def create_api_key(self, request: CreateApiKeyRequest, email: EmailStr):
        key = secrets.token_urlsafe(24)
        api_key = ApiKey(
            _id=None,
            name=request.name,
            key=key,
            masked_key=((len(key) - 4) * "*") + key[-4:],
            active=True,
            user=email,
            type=request.type.value,
        )

        try:
            self.api_key_repository.insert_one(api_key)
        except Exception:
            raise BaseError(Errors.DHRUVA204.value, traceback.format_exc())

        return key

    def get_all_api_keys(self, email: EmailStr):
        try:
            keys: List[ApiKey] = self.api_key_repository.find({"user": email})  # type: ignore
        except Exception:
            raise BaseError(Errors.DHRUVA204.value, traceback.format_exc())

        return keys
