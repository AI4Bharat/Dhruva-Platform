from bson import ObjectId
from fastapi import Depends
from schema.services.request import FeedbackSubmitRequest
from ..model import Feedback
from ..repository import FeedbackRepository
from exception.base_error import BaseError
from ..error.errors import Errors
import traceback


class FeedbackService:
    def __init__(self, feedback_repository: FeedbackRepository = Depends(FeedbackRepository)):
        self.feedback_repository = feedback_repository

    def submit_feedback(self, request: FeedbackSubmitRequest, id: ObjectId):
        try:
            feedback = request.dict()
            feedback['user_id'] = id
            feedback_obj = Feedback(**feedback)
            return self.feedback_repository.insert_one(feedback_obj)
        except Exception:
            return BaseError(Errors.DHRUVA110.value, traceback.format_exc())
