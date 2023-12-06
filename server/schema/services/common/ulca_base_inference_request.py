from typing import Any, Dict

from pydantic import BaseModel

from .ulca_base_inference_request_config import _ULCABaseInferenceRequestConfig
from .ulca_control_config import _ControlConfig


class _ULCABaseInferenceRequest(BaseModel):
    controlConfig: _ControlConfig = _ControlConfig()
    config: _ULCABaseInferenceRequestConfig

    def dict(self, **kwargs) -> Dict[str, Any]:
        kwargs.update({"by_alias": True, "exclude_none": True})
        return super().dict(**kwargs)

    def set_service_id(self, service_id: str):
        self.config.serviceId = service_id
