import time
from typing import Any, Dict

from fastapi import Depends, Request
from pymongo.database import Database
from redis_om.model.model import NotFoundError

from module.auth.model.api_key import ApiKeyCache


def populate_api_key_cache(credentials, db):
    api_key_collection = db["api_key"]
    api_key = api_key_collection.find_one({"api_key": credentials})
    api_key_cache = ApiKeyCache(**api_key)
    api_key_cache.save()
    return api_key_cache


def validate_credentials(credentials: str, request: Request, db: Database) -> bool:
    try:
        api_key = ApiKeyCache.get(credentials)
    except NotFoundError:
        try:
            api_key = populate_api_key_cache(credentials, db)
        except Exception:
            return False

    if not bool(api_key.active):
        return False

    request.state.api_key_name = api_key.name
    request.state.user_id = api_key.user_id
    request.state.api_key_id = api_key.id
    request.state.api_key_data_tracking = bool(api_key.data_tracking)
    request.state.api_key_type = api_key.type

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
