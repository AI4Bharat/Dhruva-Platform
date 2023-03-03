from fastapi import APIRouter

from exception.base_error import BaseErrorResponse

from .api_key_router import router as ApiKeyApiRouter
from .auth_router import router as AuthApiRouter
from .user_router import router as UserApiRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={"500": {"model": BaseErrorResponse}},
)

router.include_router(AuthApiRouter)
router.include_router(ApiKeyApiRouter)
router.include_router(UserApiRouter)
