from typing import List

from pydantic import BaseModel


class ULCAFeedbackQuestionRequest(BaseModel):
    feedbackLanguage: str
    supportedTasks: List[str]
