from fastapi import Header, HTTPException, Request, status

from auth.token_type import TokenType
from schema.auth.common import ApiKeyType


class ApiKeyTypeAuthorizationProvider:
    def __init__(self, required_type: ApiKeyType):
        self.required_type = required_type

    def __call__(self, request: Request, x_auth_source: TokenType = Header(default=TokenType.API_KEY)):
        if x_auth_source == TokenType.AUTH_TOKEN:
            return

        if ApiKeyType[request.state.api_key_type] != self.required_type:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Not authorized"},
            )
