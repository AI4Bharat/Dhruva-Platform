from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

from auth import api_key_provider, auth_token_provider
from auth.token_type import TokenType
from db.app_db import AppDatabase


def AuthProvider(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    # This header specifies the origin of the request which
    # can either be API_KEY or AUTH_TOKEN
    x_auth_source: Optional[TokenType] = Header(default=TokenType.API_KEY),
    db: AppDatabase = Depends(AppDatabase),
):
    match x_auth_source:
        case TokenType.AUTH_TOKEN:
            provider = auth_token_provider
        case TokenType.API_KEY:
            provider = api_key_provider

    if not provider.validate_credentials(credentials.credentials, db):  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Not authenticated"},
        )
