from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer

from auth import api_key_provider, auth_token_provider
from auth.token_type import TokenType


def AuthProvider(
    credentials: Optional[str] = Depends(HTTPBearer(auto_error=False)),
    # This header specifies the origin of the request which
    # can either be API_KEY or AUTH_TOKEN
    x_dhruva_source: TokenType = Header(),
):
    provider = None
    if x_dhruva_source == TokenType.API_KEY:
        provider = api_key_provider

    elif x_dhruva_source == TokenType.AUTH_TOKEN:
        provider = auth_token_provider

    if not provider.validate_credentials(credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Not authenticated"},
        )


# class AuthProvider:
#     def __init__(
#         self,
#         credentials: Optional[str] = Depends(
#             APIKeyHeader(name="authorization", auto_error=False)
#         ),
#         # This header specifies the origin of the request which
#         # can either be APIKEY or AUTHTOKEN
#         source: Optional[str] = Depends(
#             APIKeyHeader(name="x-dhruva-source", auto_error=False)
#         ),
#         api_key_provider: ApiKeyProvider = Depends(ApiKeyProvider),
#         auth_token_provider: AuthTokenProvider = Depends(AuthTokenProvider),
#     ) -> None:
#         provider = None
#         if source == "API_KEY":
#             provider = api_key_provider

#         elif source == "AUTH_TOKEN":
#             provider = auth_token_provider

#         if not provider:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail={"message": "invalid source"},
#             )

#         if not provider.validate_credentials(credentials):
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail={"message": "Not authenticated"},
#             )
