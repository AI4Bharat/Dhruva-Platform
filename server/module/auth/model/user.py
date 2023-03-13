from db.MongoBaseModel import MongoBaseModel
from pydantic import EmailStr
from schema.auth.common import RoleType


class User(MongoBaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleType
