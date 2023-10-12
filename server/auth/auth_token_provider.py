import os
from typing import Any, Dict

import jwt
from bson.objectid import ObjectId
from dotenv import load_dotenv
from exception import BaseError
from fastapi import Request
from pymongo.database import Database

from .errors import Errors

load_dotenv()


def validate_credentials(credentials: str, request: Request, db: Database) -> bool:
    try:
        headers = jwt.get_unverified_header(credentials)
    except Exception:
        return False

    if headers["tok"] != "access":
        return False

    try:
        claims = jwt.decode(
            credentials, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
    except Exception:
        return False

    session_collection = db["session"]
    session = session_collection.find_one({"_id": ObjectId(claims["sess_id"])})
    if "inference" in request.url.path or "feedback" in request.url.path:
        user_id = claims["sub"]
        api_key_collection = db["api_key"]
        api_key = api_key_collection.find_one(
            {"name": "default", "user_id": ObjectId(user_id)}
        )

        if api_key is None:
            raise BaseError(
                error=Errors.DHRUVA_DEP100.value,
            )

        request.state.api_key_id = api_key["_id"]
        request.state.api_key_type = api_key["type"]
        request.state.api_key_name = "default"

    request.state.user_id = claims["sub"]

    if not session:
        return False

    return True


def fetch_session(credentials: str, db: Database):
    # This cannot fail, since this was already checked during auth verification
    claims = jwt.decode(
        credentials, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"]
    )

    session_collection = db["session"]
    user_collection = db["user"]

    # Session has to exist since it was already checked during auth verification
    session: Dict[str, Any] = session_collection.find_one(  # type: ignore
        {"_id": ObjectId(claims["sess_id"])}
    )

    user_id = session["user_id"]

    user: Dict[str, Any] = user_collection.find_one({"_id": user_id})  # type: ignore
    del user["password"]

    return user
