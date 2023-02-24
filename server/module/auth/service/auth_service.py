import os
import time
import traceback

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status

from exception.base_error import BaseError
from schema.auth.request import RefreshRequest, SignInRequest
from schema.auth.response import SignInResponse

from ..error import Errors
from ..repository import UserRepository

load_dotenv()


class AuthService:
    def __init__(
        self, user_repository: UserRepository = Depends(UserRepository)
    ) -> None:
        self.user_repository = user_repository

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

        token = jwt.encode(
            {
                "sub": user.email,
                "name": user.name,
                "exp": (time.time() + 31536000),
                "iat": time.time(),
            },
            os.environ["JWT_SECRET_KEY"],
            algorithm="HS256",
            headers={"tok": "refresh"},
        )

        # create and return jwt
        return SignInResponse(email=user.email, token=token, role=user.role)

    def get_refresh_token(self, request: RefreshRequest):
        try:
            claims = jwt.decode(
                request.token, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Invalid refresh token"},
            )

        headers = jwt.get_unverified_header(request.token)
        if headers.get("tok") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Invalid refresh token"},
            )

        token = jwt.encode(
            {
                "sub": claims["sub"],
                "name": claims["name"],
                "exp": (time.time() + 2592000),
                "iat": time.time(),
            },
            os.environ["JWT_SECRET_KEY"],
            algorithm="HS256",
            headers={"tok": "access"},
        )

        return token
