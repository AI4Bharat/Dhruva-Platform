import time
from typing import Any, Dict

from fastapi import Request
from pymongo.database import Database

from module.auth.model.api_key import ApiKeyCache


def validate_credentials(credentials: str, request: Request) -> bool:
    api_key = ApiKeyCache.get(credentials)

    if not api_key or not bool(api_key.active):
        return False

    request.state.api_key_name = api_key.name
    request.state.user_id = api_key.user_id
    request.state.api_key_id = api_key.id

    return True


def fetch_session(credentials: str, db: Database):
    api_key_collection = db["api_key"]
    user_collection = db["user"]

    # Api key has to exist since it was already checked during auth verification
    api_key: Dict[str, Any] = api_key_collection.find_one({"api_key": credentials})  # type: ignore

    user_id = api_key["user_id"]

    user: Dict[str, Any] = user_collection.find_one({"_id": user_id})  # type: ignore
    del user["password"]

    return user
