from typing import Optional
from db.MongoBaseModel import ObjectIdField
from pydantic import Field, BaseModel
from db.MongoBaseModel import MongoBaseModel


class _LanguagePair(BaseModel):
    sourceLanguage: str
    targetLanguage: Optional[str]


class Feedback(MongoBaseModel):
    language: _LanguagePair
    comments: str
    example: str
    rating: int
    service_id: str
    user_id: ObjectIdField = Field(default=None)
