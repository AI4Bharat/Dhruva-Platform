import os
from typing import Optional

import jwt
from bson.objectid import ObjectId
from dotenv import load_dotenv
from fastapi import Depends

from db.app_db import AppDatabase

load_dotenv()


def validate_credentials(credentials: str, db: AppDatabase) -> bool:
    headers = jwt.get_unverified_header(credentials)
    if headers["tok"] != "access":
        return False

    try:
        claims = jwt.decode(
            credentials, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
    except Exception:
        return False

    session_collection = db["session"]
    session = session_collection.find_one({"_id": ObjectId(claims["id"])})

    if not session:
        return False

    return True
