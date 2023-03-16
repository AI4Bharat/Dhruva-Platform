
from db.MongoBaseModel import MongoBaseModel

class Feedback(MongoBaseModel):
    language: str
    comments: str
    example: str
    rating: int

