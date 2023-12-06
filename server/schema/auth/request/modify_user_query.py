from typing import Any, Dict, Optional

from pydantic import BaseModel, root_validator


class ModifyUserQuery(BaseModel):
    name: Optional[str]
    password: Optional[str]

    @root_validator()
    def validate_request(cls, values: Dict[str, Any]):
        if values.get("name") == None and values.get("password") == None:
            raise ValueError("Atleast one of name or password must be provided")
        else:
            return values
