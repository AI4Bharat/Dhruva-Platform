from pydantic import BaseModel, EmailStr, Field

from ..common.role_type import RoleType


class SignInResponse(BaseModel):
    id: str
    email: EmailStr
    token: str
    role: RoleType
