from pydantic import BaseModel


class _ULCALanguage(BaseModel):
    sourceLanguage: str
