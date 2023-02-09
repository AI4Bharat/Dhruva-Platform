from pydantic import BaseModel
from .ulca_language import _ULCALanguage

class _ULCABaseMonolingualTaskConfig(BaseModel):
    language: _ULCALanguage
