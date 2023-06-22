from datetime import datetime

from bson import ObjectId

from db.MongoBaseModel import MongoBaseModel
from schema.services.request import ULCAFeedbackRequest


class Feedback(MongoBaseModel, ULCAFeedbackRequest):
    user_id: ObjectId
    api_key_name: str

    def to_export_row(self):
        pipeline_tasks, input_data = (
            ([], None)
            if not self.pipelineInput
            else (self.pipelineInput.pipelineTasks, self.pipelineInput.inputData)
        )

        pipeline_response = (
            [] if not self.pipelineOutput else self.pipelineOutput.pipelineResponse
        )

        suggested_pipeline_response = (
            []
            if not self.suggestedPipelineOutput
            else self.suggestedPipelineOutput.pipelineResponse
        )

        pipeline_feedback = (
            [] if not self.pipelineFeedback else self.pipelineFeedback.commonFeedback
        )

        task_feedback = [] if not self.taskFeedback else self.taskFeedback

        row = [
            self.id,
            datetime.utcfromtimestamp(int(self.feedbackTimeStamp)).isoformat(),
            self.feedbackLanguage,
            list(map(lambda obj: obj.json(), pipeline_tasks)),
            None if not input_data else input_data.json(),
            list(map(lambda obj: obj.json(), pipeline_response)),
            list(map(lambda obj: obj.json(), suggested_pipeline_response)),
            list(map(lambda obj: obj.json(), pipeline_feedback)),
            list(map(lambda obj: obj.json(), task_feedback)),
        ]

        return row
