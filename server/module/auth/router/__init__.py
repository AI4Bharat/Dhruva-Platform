from exception.base_error import BaseErrorResponse
from fastapi import APIRouter

from .api_key_router import router as ApiKeyApiRouter
from .auth_router import router as AuthApiRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={"500": {"model": BaseErrorResponse}},
)

router.include_router(AuthApiRouter)
router.include_router(ApiKeyApiRouter)
