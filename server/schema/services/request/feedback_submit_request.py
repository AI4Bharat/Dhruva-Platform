from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

from pydantic import BaseModel, validator

from schema.services.common import (
    _ULCATranslationInferenceConfig,
    _ULCATransliterationInferenceConfig,
)

from ..common import _ULCATaskType
from ..response import ULCAGenericInferenceResponse
from .ulca_asr_inference_request import _ULCAAsrInferenceRequestConfig
from .ulca_ner_inference_request import _ULCANerInferenceRequestConfig
from .ulca_pipeline_inference_request import (
    ULCAPipelineInferenceRequestWithoutControlConfig,
)
from .ulca_tts_inference_request import _ULCATtsInferenceRequestConfig


class _FeedbackType(str, Enum):
    RATING = "rating"
    COMMENT = "comment"
    THUMBS = "thumbs"
    RATING_LIST = "rating-list"
    COMMENT_LIST = "comment-list"
    THUMBS_LIST = "thumbs-list"
    CHECKBOX_LIST = "checkbox-list"


class RequestConfig(BaseModel):
    taskType: _ULCATaskType
    config: Union[
        _ULCANerInferenceRequestConfig,
        _ULCATranslationInferenceConfig,
        _ULCATransliterationInferenceConfig,
        _ULCAAsrInferenceRequestConfig,
        _ULCATtsInferenceRequestConfig,
    ]


class PipelineOutput(BaseModel):
    pipelineResponse: List[ULCAGenericInferenceResponse]


class PipelineInput(ULCAPipelineInferenceRequestWithoutControlConfig):
    pass


class BaseFeedbackType(BaseModel):
    parameterName: str


class FeedbackTypeRating(BaseFeedbackType):
    rating: int


class FeedbackTypeCheckbox(BaseFeedbackType):
    isSelected: bool


class FeedbackTypeComment(BaseFeedbackType):
    comment: str


class FeedbackTypeThumbs(BaseFeedbackType):
    isLiked: bool


class CommonFeedback(BaseModel):
    question: str
    feedbackType: _FeedbackType
    comment: Optional[str]
    isLiked: Optional[bool]
    rating: Optional[int]


class GranularFeedback(CommonFeedback):
    checkboxList: Optional[List[FeedbackTypeCheckbox]]
    ratingList: Optional[List[FeedbackTypeRating]]
    commentList: Optional[List[FeedbackTypeComment]]
    thumbsList: Optional[List[FeedbackTypeThumbs]]


class TaskFeedback(BaseModel):
    taskType: _ULCATaskType
    commonFeedback: List[CommonFeedback]
    granularFeedback: Optional[List[GranularFeedback]]


class PipelineFeedback(BaseModel):
    commonFeedback: List[CommonFeedback]


class ULCAFeedbackRequest(BaseModel):
    feedbackTimeStamp: int = int(datetime.now().timestamp())
    feedbackLanguage: str
    pipelineInput: PipelineInput
    pipelineOutput: Optional[PipelineOutput]
    suggestedPipelineOutput: Optional[PipelineOutput]
    pipelineFeedback: Optional[PipelineFeedback]
    taskFeedback: Optional[List[TaskFeedback]]

    @validator("feedbackTimeStamp")
    def check_feedback_timestamp_format(cls, v):
        if v > 9999999999:
            raise ValueError("UNIX Timestamp should be in seconds")

        return v
