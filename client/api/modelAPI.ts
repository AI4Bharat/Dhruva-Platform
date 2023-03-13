import { dhruvaAPI,apiInstance } from "./apiConfig";

const listModels = async (): Promise<ModelList[]> => {
  const response = await apiInstance({
    method: "GET",
    url: dhruvaAPI.listModels,
  });
  return response.data;
};

const getModel = async (modelId: string | string[]): Promise<ModelView> => {
  const response = await apiInstance({
    method: "POST",
    url: dhruvaAPI.viewModel,
    data: {
      modelId: modelId,
    },
  });
  return response.data;
};

export { listModels, getModel };
