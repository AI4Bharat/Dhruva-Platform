from pydantic import EmailStr

from db.MongoBaseModel import MongoBaseModel


class User(MongoBaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
