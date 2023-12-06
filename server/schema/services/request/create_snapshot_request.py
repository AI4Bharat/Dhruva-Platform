from pydantic import BaseModel


class CreateSnapshotRequest(BaseModel):
    user_id: str
    api_key_name: str
    inference_service_id: str
