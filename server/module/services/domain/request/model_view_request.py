from pydantic import BaseModel


class ModelViewRequest(BaseModel):
    modelId: str
