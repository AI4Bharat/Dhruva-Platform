from fastapi import HTTPException, Request, status

from schema.auth.common import ApiKeyType


def ApiKeyTypeAuthorizationProvider(request: Request, required_type: ApiKeyType):
    if ApiKeyType[request.state.api_key_type] != required_type:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Not authorized"},
        )
