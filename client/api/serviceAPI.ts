import axios from "axios";
import { dhruvaAPI } from "./apiConfig";

const listServices = async (): Promise<ServiceList[]> => {
  const response = await axios({
    method: "GET",
    url: dhruvaAPI.listServices,
  });
  return response.data;
};

const getService = async (
  serviceId: string | string[]
): Promise<ServiceView> => {
  const response = await axios({
    method: "POST",
    url: dhruvaAPI.viewService,
    data: {
      serviceId: serviceId,
    },
  });
  return response.data;
};

export { listServices, getService };
