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
  // const response = await apiInstance.post(
  //   "https://dev-auth.ulcacontrib.org/ulca/mdms/v0/pipelineQuestions",
  //   feedbackRequest
  // );
  // return response.data;
  let res = {
    feedbackLanguage: "en",
    pipelineFeedback: {
      commonFeedback: [
        {
          question: "Are you satisfied with the pipeline response?",
          supportedFeedbackTypes: ["rating", "thumbs", "comment"],
        },
      ],
    },
    taskFeedback: [
      {
        taskType: "asr",
        commonFeedback: [
          {
            question: "Are you satisfied with the ASR response?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
        ],
        granularFeedback: [
          {
            question: "Was the speech accurately recognised?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
          {
            question: "Which are the areas that ASR can improve upon?",
            supportedFeedbackTypes: [
              "rating-list",
              "comment-list",
              "thumbs-list",
              "checkbox-list",
            ],
            parameters: [
              "names",
              "places",
              "numbers",
              "dates",
              "English words / code mixed words",
              "technical terms",
            ],
          },
          {
            question: "Was the background noise handled properly?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
          {
            question:
              "Was the application able to recognise the speech if you spoke in an accented tone?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
          {
            question:
              "Is there any other specific case where the Speech was constantly incorrectly recognised?",
            supportedFeedbackTypes: ["comment"],
          },
          {
            question: "How would you rate the Speech Recognition?",
            supportedFeedbackTypes: ["rating"],
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
              "Was the application able to translate complex sentences?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
          {
            question: "Which are the areas that Translation can improve upon?",
            supportedFeedbackTypes: [
              "rating-list",
              "comment-list",
              "thumbs-list",
              "checkbox-list",
            ],
            parameters: [
              "names",
              "places",
              "numbers",
              "dates",
              "English words / code mixed words",
              "technical terms",
              "URLs",
            ],
          },
          {
            question:
              "Was the translated text grammatically correct and well-structured?",
            supportedFeedbackTypes: ["rating", "thumbs", "comment"],
          },
          {
            question:
              "Is there any other specific case where the translation seemed to fail?",
            supportedFeedbackTypes: ["comment"],
          },
          {
            question: "How would you rate the translation?",
            supportedFeedbackTypes: ["rating"],
          },
        ],
      },
    ],
  };
  return res;
};

export {
  listServices,
  getService,
  submitFeedback,
  listallkeys,
  listalluserkeys,
  fetchFeedbackQuestions,
};
