from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field
from ...common import ObjectIdField


class GetUsersResponse(BaseModel):
    id: ObjectIdField = Field(..., alias="_id")
    name: str
    email: EmailStr

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
        }
