from typing import Optional

from auth import api_key_provider, auth_token_provider
from auth.token_type import TokenType
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import APIKeyHeader, HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from pymongo.database import Database

from auth import api_key_provider, auth_token_provider
from auth.token_type import TokenType
from db.database import AppDatabase



def AuthProvider(
    request: Request,
    credentials_bearer: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    credentials_key: Optional[str] = Depends(APIKeyHeader(name="Authorization")),
    # This header specifies the origin of the request which
    # can either be API_KEY or AUTH_TOKEN
    x_auth_source: TokenType = Header(default=TokenType.API_KEY),
    db: Database = Depends(AppDatabase),
):
    match x_auth_source:
        case TokenType.AUTH_TOKEN:
            if not credentials_bearer:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"message": "Not authenticated"},
                )

            validate_status = auth_token_provider.validate_credentials(
                credentials_bearer.credentials, request, db
            )
        case TokenType.API_KEY:
            if not credentials_key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={"message": "Not authenticated"},
                )

            validate_status = api_key_provider.validate_credentials(
                credentials_key, request, db
            )

    if not validate_status:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Not authenticated"},
        )
