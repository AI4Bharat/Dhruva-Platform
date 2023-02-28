from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field
import pydantic
class ObjectIdField():
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid id")

        return ObjectId(value)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    _id: Optional[ObjectIdField] 

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }


pydantic.json.ENCODERS_BY_TYPE[ObjectId]=str # type: ignore