from pydantic import BaseModel


class _ControlConfig(BaseModel):
    dataTracking: bool = True
