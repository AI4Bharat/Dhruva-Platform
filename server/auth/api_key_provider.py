from typing import Optional

from fastapi import Depends

from db.app_db import AppDatabase


# logic will be changed when the api_key repository is created
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

    return True
