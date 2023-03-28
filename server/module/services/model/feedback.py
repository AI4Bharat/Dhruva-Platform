
from typing import Optional
from db.MongoBaseModel import ObjectIdField
from pydantic import Field
from db.MongoBaseModel import MongoBaseModel

class Feedback(MongoBaseModel):
    language: str
    comments: str
    example: str
    rating: int
    service_id: str
    user_id: ObjectIdField = Field(default=None)

