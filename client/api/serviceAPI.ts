import { ULCAFeedbackRequest } from "../components/Feedback/FeedbackTypes";
import { dhruvaAPI, apiInstance } from "./apiConfig";


const listServices = async (): Promise<ServiceList[]> => {
  const response = await apiInstance({
    method: "GET",
    url: dhruvaAPI.listServices,
  });

  return response.data;
};

const listallkeys = async (target_service_id: string) => {
  const response = await apiInstance.get(
    `/auth/api-key/list?target_service_id=${target_service_id}`
  );
  return response.data;
};

const listalluserkeys = async (target_service_id: string, user_id: string) => {
  const response = await apiInstance.get(
    `/auth/api-key/list?target_user_id=${user_id}&target_service_id=${target_service_id}`
  );
  return response.data;
};

const getService = async (
  serviceId: string | string[]
): Promise<ServiceView> => {
  const response = await apiInstance({
    method: "POST",
    url: dhruvaAPI.viewService,
    data: {
      serviceId: serviceId,
    },
  });
  return response.data;
};

const submitFeedback = async (feedback: ULCAFeedbackRequest) => {
  const response = await apiInstance.post(
    `/services/feedback/submit`,
    feedback
  );
  return response.data;
};

const fetchFeedbackQuestions = async (feedbackRequest) => {
  return {
    feedbackLanguage: "en",
    pipelineFeedback: {
      commonFeedback: [
        {
          question: "Are you satisfied with the pipeline so far?",
          supportedFeedbackTypes: ["rating", "thumbs", "comment"],
        },
      ],
    },
    taskFeedback: [
      {
        taskType: "asr",
        commonFeedback: [
          {
            question: "Are you satisfied with the ASR response so far?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
        ],
        granularFeedback: [
          {
            question:
              "Which of the following parameters are you not satisfied with?",
            supportedFeedbackTypes: [
              "rating-list",
              "comment-list",
              "thumbs-list",
              "checkbox-list",
            ],
            parameters: ["accuracy", "speed", "readability"],
          },
        ],
      },
      {
        taskType: "translation",
        commonFeedback: [
          {
            question: "Are you satisfied with the Translation response so far?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
        ],
        granularFeedback: [
          {
            question:
              "Which of the following parameters are you not satisfied with?",
            supportedFeedbackTypes: [
              "rating-list",
              "comment-list",
              "thumbs-list",
              "checkbox-list",
            ],
            parameters: ["accuracy", "speed", "readability"],
          },
        ],
      },
    ],
  };
};

export {
  listServices,
  getService,
  submitFeedback,
  listallkeys,
  listalluserkeys,
  fetchFeedbackQuestions,
};
