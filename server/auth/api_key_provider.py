from typing import Dict, Any
from db.app_db import AppDatabase
from fastapi import Request


def validate_credentials(credentials: str, request: Request, db: AppDatabase) -> bool:
    api_key_collection = db["api_key"]
    api_key = api_key_collection.find_one({"key": credentials})

    if not api_key or not api_key["active"]:
        return False

    request.state.api_key_id = api_key["_id"]

    return True


def fetch_session(credentials: str, db: AppDatabase):
    api_key_collection = db["api_key"]
    user_collection = db["user"]

    # Api key has to exist since it was already checked during auth verification
    api_key: Dict[str, Any] = api_key_collection.find_one({"key": credentials})  # type: ignore

    user_id = api_key["user_id"]

    user: Dict[str, Any] = user_collection.find_one({"_id": user_id})  # type: ignore
    del user["password"]

    return user
