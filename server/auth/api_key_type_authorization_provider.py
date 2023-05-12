from fastapi import HTTPException, Request, status

from schema.auth.common import ApiKeyType


class ApiKeyTypeAuthorizationProvider:
    def __init__(self, required_type: ApiKeyType):
        self.required_type = required_type

    def __call__(self, request: Request):
        if ApiKeyType[request.state.api_key_type] != self.required_type:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Not authorized"},
            )
