import requests
from fastapi import Depends
from schema.services.request import ULCAFeedbackRequest,ULCAFeedbackQuestionRequest
from ..model import Feedback
from ..repository import FeedbackRepository
from exception.base_error import BaseError
from ..error.errors import Errors
import traceback
from bson import ObjectId

class FeedbackService:
    def __init__(self, feedback_repository: FeedbackRepository = Depends(FeedbackRepository)):
        self.feedback_repository = feedback_repository

    def submit_feedback(self, request: ULCAFeedbackRequest, id: ObjectId):
        try:
            feedback = request.dict()
            feedback["user_id"] = id
            feedback["api_key_name"] = "default"
            feedback_obj = Feedback(**feedback)
            return self.feedback_repository.insert_one(feedback_obj)
        except Exception:
            return BaseError(Errors.DHRUVA110.value, traceback.format_exc())

    def fetch_questions(self,request:ULCAFeedbackQuestionRequest):
        return requests.post("https://dev-auth.ulcacontrib.org/ulca/mdms/v0/pipelineQuestions",json=request.dict()).json()
