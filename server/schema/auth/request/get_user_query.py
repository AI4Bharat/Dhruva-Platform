from pydantic import BaseModel, EmailStr


class GetUserQuery(BaseModel):
    email: EmailStr
