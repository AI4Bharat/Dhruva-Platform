from typing import Optional

import jwt
from fastapi import Depends

from db.app_db import AppDatabase


def validate_credentials(
    credentials: Optional[str], db: AppDatabase = Depends(AppDatabase)
) -> bool:
    if not credentials:
        return False

    token_collection = db["token"]
    token = token_collection.find_one({"key": credentials})

    if not token:
        return False

    if token["key"] != credentials:
        return False

    try:
        jwt.decode(credentials)
    except Exception:
        return False

    return True
