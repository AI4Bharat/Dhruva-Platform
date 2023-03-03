from bson import ObjectId
from fastapi import Depends, Header
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from pydantic import EmailStr, Field

from auth import TokenType, api_key_provider, auth_token_provider
from db.app_db import AppDatabase
from db.MongoBaseModel import MongoBaseModel


def InjectSession(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    x_auth_source: TokenType = Header(default=TokenType.API_KEY),
    db: AppDatabase = Depends(AppDatabase),
):
    """
    Injects session details into a view function.

    WARNING: Only use in protected routes, otherwise it will throw an error.
    """

    if not credentials:
        raise Exception("Route not protected by authentication")

    match x_auth_source:
        case TokenType.AUTH_TOKEN:
            provider = auth_token_provider
        case TokenType.API_KEY:
            provider = api_key_provider

    session = provider.fetch_session(credentials.credentials, db)  # type: ignore
    return Session(**session)


class Session(MongoBaseModel):
    id: ObjectId = Field(alias="_id")
    name: str
    email: EmailStr
    role: str
