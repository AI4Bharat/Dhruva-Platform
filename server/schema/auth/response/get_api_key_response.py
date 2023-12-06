import json
from typing import AbstractSet, Any, Dict, Mapping, Optional, Union

from pydantic import BaseModel, Field, validator

from schema.auth.common import ApiKey


class GetApiKeyResponse(ApiKey):
    id: str = Field(alias="_id")

    def dict(self, **kwargs) -> Dict[str, Any]:
        kwargs.update({"by_alias": False})
        return super().dict(**kwargs)

    @validator("id", pre=True)
    def typecast_id_to_str(cls, v):
        return str(v)
