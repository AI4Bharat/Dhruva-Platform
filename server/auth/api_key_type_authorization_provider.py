from fastapi import HTTPException, Request, status

from schema.auth.common import ApiKeyType


def ApiKeyTypeAuthorizationProvider(required_type: ApiKeyType, request: Request):
    if ApiKeyType[request.state.api_key_type] != required_type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Not authorized"},
        )
