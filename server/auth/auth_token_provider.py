import os
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends

from db.app_db import AppDatabase

load_dotenv()


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
        jwt.decode(credentials, key=os.environ["JWT_SECRET_KEY"], algorithms=["HS256"])
    except Exception:
        return False

    headers = jwt.get_unverified_header(credentials)
    if headers["tok"] != "access":
        return False

    return True
