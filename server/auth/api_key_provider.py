from typing import Optional

from argon2 import PasswordHasher
from bson.objectid import ObjectId
from fastapi import Depends

from db.app_db import AppDatabase


# logic will be changed when the api_key repository is created
def validate_credentials(credentials: str, db: AppDatabase) -> bool:
    objectId = credentials[-24:]

    api_key_collection = db["api_key"]
    api_key = api_key_collection.find_one({"_id": ObjectId(objectId)})

    if not api_key or not api_key["active"]:
        return False

    hashed_key = api_key["key"]
    ph = PasswordHasher()

    try:
        ph.verify(hashed_key, credentials)
    except Exception:
        return False

    return True
