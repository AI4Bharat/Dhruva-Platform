from db.app_db import AppDatabase


def validate_credentials(credentials: str, db: AppDatabase) -> bool:
    api_key_collection = db["api_key"]
    api_key = api_key_collection.find_one({"key": credentials})

    if not api_key or not api_key["active"]:
        return False

    return True


def fetch_session(credentials: str, db: AppDatabase):
    api_key_collection = db["api_key"]
    user_collection = db["user"]

    # Api key has to exist since it was already checked during auth verification
    api_key: Dict[str, Any] = api_key_collection.find_one({"key": credentials})  # type: ignore

    email = api_key["user"]

    user: Dict[str, Any] = user_collection.find_one({"email": email})  # type: ignore
    del user["password"]

    return user
