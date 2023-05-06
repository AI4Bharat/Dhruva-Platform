from typing import Optional
from db.MongoBaseModel import ObjectIdField
from pydantic import Field, BaseModel
from db.MongoBaseModel import MongoBaseModel
from schema.services.request import ULCAFeedbackRequest


class _LanguagePair(BaseModel):
    sourceLanguage: str
    targetLanguage: Optional[str]


class Feedback(MongoBaseModel,ULCAFeedbackRequest):
    user_id: ObjectIdField = Field(default=None)
    api_key_name: str = Field(default=None)
