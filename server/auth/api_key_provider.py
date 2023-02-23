from typing import Optional
from fastapi import Depends
from fastapi.security import APIKeyHeader
from motor.motor_asyncio import AsyncIOMotorClient

from db.database import get_db_client
from fastapi import Request


async def api_key_provider(
    request: Request,
    credentials: Optional[str] = Depends(
        APIKeyHeader(name="authorization", auto_error=False)
    ),
    db: AsyncIOMotorClient = Depends(get_db_client),
):
    if not credentials:
        return False, None

    api_key_check = await db.api_key.find_one({'api_key': credentials})
    if api_key_check:
        request.state.api_key_name = credentials
        return True
    return False
