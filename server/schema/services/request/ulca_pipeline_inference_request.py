from typing import Any, Dict, List

from pydantic import BaseModel

from ..common import _ULCATaskType
from ..common.ulca_control_config import _ControlConfig
from .ulca_generic_inference_request import ULCAGenericInferenceRequestWithoutConfig


class _ULCAPipelineTask(BaseModel):
    taskType: _ULCATaskType
    config: Dict[str, Any]


class ULCAPipelineInferenceRequestWithoutControlConfig(BaseModel):
    pipelineTasks: List[_ULCAPipelineTask]
    inputData: ULCAGenericInferenceRequestWithoutConfig


class ULCAPipelineInferenceRequest(ULCAPipelineInferenceRequestWithoutControlConfig):
    controlConfig: _ControlConfig = _ControlConfig()
