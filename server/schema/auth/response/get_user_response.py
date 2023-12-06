from pydantic import BaseModel, EmailStr

from schema.auth.common import RoleType


class GetUserResponse(BaseModel):
    name: str
    email: EmailStr
    role: RoleType
