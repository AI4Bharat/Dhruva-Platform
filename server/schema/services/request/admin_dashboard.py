from pydantic import BaseModel


class ViewAdminDashboardRequest(BaseModel):
    page: int = 1
    limit: int = 10
    target_user_id: str
