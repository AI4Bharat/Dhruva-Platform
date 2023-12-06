from pydantic import AnyHttpUrl, BaseModel


class CreateGrafanaSnapshotResponse(BaseModel):
    deleteKey: str
    deleteUrl: AnyHttpUrl
    id: int
    key: str
    url: AnyHttpUrl
