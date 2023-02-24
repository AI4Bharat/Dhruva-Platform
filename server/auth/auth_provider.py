from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer

from auth import api_key_provider, auth_token_provider
from auth.token_type import TokenType


def AuthProvider(
    credentials: Optional[str] = Depends(HTTPBearer(auto_error=False)),
    # This header specifies the origin of the request which
    # can either be API_KEY or AUTH_TOKEN
    x_auth_source: TokenType = Header(),
):
    provider = None
    if x_auth_source == TokenType.API_KEY:
        provider = api_key_provider

    elif x_auth_source == TokenType.AUTH_TOKEN:
        provider = auth_token_provider

    if not provider.validate_credentials(credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Not authenticated"},
        )
