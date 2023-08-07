from typing import Any, Dict, List

from bson import ObjectId
from db.database import AppDatabase
from exception import ClientError
from fastapi import Depends, Request, status
from pymongo.database import Database
from schema.auth.common import RoleType


class RoleAuthorizationProvider:
    def __init__(self, roles: List[RoleType]) -> None:
        self.roles = roles

    def __call__(self, request: Request, db: Database = Depends(AppDatabase)):
        user_collection = db["user"]
        user: Dict[str, Any] = user_collection.find_one(
            {"_id": ObjectId(request.state.user_id)}
        )  # type: ignore

        user_role = RoleType[user["role"]]

        if user_role == RoleType.ADMIN:
            return

        if user_role not in self.roles:
            raise ClientError(
                status_code=status.HTTP_403_FORBIDDEN,
                message="Not authorized",
            )
