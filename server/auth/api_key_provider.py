from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from db.database import Database


class ApiKeyProvider:
    def __init__(
        self,
        credentials: Optional[str] = Depends(
            APIKeyHeader(name="authorization", auto_error=False)
        ),

        # this will be replaced with an api_key repository when it is created
        db: Database = Depends(Database)
    ) -> None:
        self.db = db

        if not self.validate_credentials(credentials):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": "Not authenticated"
                }
            )

    # logic will be changed when the api_key repository is created
    def validate_credentials(self, credentials: Optional[str]) -> bool:
        if not credentials:
            return False

        api_key_collection: list[dict] = self.db["api_key"]
        for api_key in api_key_collection:
            if api_key["key"] == credentials:
                return True

        return False
