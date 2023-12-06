from pydantic import BaseModel, EmailStr

from ..common.role_type import RoleType


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleType
