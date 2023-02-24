from fastapi import APIRouter

from exception.base_error import BaseErrorResponse

from .auth_router import router as AuthApiRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={"500": {"model": BaseErrorResponse}},
)

router.include_router(AuthApiRouter)
