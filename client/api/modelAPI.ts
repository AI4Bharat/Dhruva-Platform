import axios from "axios";
import { dhruvaAPI } from "./apiConfig";

const listModels = async (): Promise<ModelList[]> => {
  const response = await axios({
    method: "GET",
    url: dhruvaAPI.listModels,
  });
  return response.data;
};

const getModel = async (modelId: string | string[]): Promise<ModelView> => {
  const response = await axios({
    method: "POST",
    url: dhruvaAPI.viewModel,
    data: {
      modelId: modelId,
    },
  });
  return response.data;
};

export { listModels, getModel };
