import { dhruvaAPI, apiInstance } from "./apiConfig";

interface IFeedback
{
  language: string,
  example: string,
  rating: number,
  comments: string,
  service_id: string
}



const listServices = async (): Promise<ServiceList[]> => {
  const response = await apiInstance({
    method: "GET",
    url: dhruvaAPI.listServices,
  });
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

const submitFeedback = async (feedback : IFeedback) => {
  const response = await apiInstance.post(
    `/services/feedback/submit`,feedback
  );
  return response.data;
};

export { listServices, getService, submitFeedback };
