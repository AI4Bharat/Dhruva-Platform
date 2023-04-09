import axios from "axios";

const dhruvaRootURL: string = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const dhruvaAPI: { [key: string]: string } = {
  listServices: `${dhruvaRootURL}/services/details/list_services`,
  viewService: `${dhruvaRootURL}/services/details/view_service`,
  listModels: `${dhruvaRootURL}/services/details/list_models`,
  viewModel: `${dhruvaRootURL}/services/details/view_model`,
  genericInference: `${dhruvaRootURL}/services/inference`,
  translationInference: `${dhruvaRootURL}/services/inference/translation`,
  ttsInference: `${dhruvaRootURL}/services/inference/tts`,
  asrInference: `${dhruvaRootURL}/services/inference/asr`,
  asrStreamingInference: `wss://api.dhruva.ai4bharat.org`,
  stsInference: `${dhruvaRootURL}/services/inference/s2s`,
  nerInference: `${dhruvaRootURL}/services/inference/ner`,
  pipelineInference: `${dhruvaRootURL}/services/inference/pipeline`,
};

const apiInstance = axios.create({ baseURL: dhruvaRootURL });

apiInstance.interceptors.request.use((config: any) => {
  config.headers["request-startTime"] = new Date().getTime();
  config.headers["Authorization"] = `Bearer ${localStorage.getItem(
    "access_token"
  )}`;
  config.headers["x-auth-source"] = "AUTH_TOKEN";
  return config;
});

apiInstance.interceptors.response.use(
  (response: any) => {
    const currentTime = new Date().getTime();
    const startTime = response.config.headers["request-startTime"];
    response.headers["request-duration"] = currentTime - startTime;
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== `${dhruvaRootURL}/auth/refresh`
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      return axios
        .post(`${dhruvaRootURL}/auth/refresh`, { token: refreshToken })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("access_token", res.data.token);
            apiInstance.defaults.headers.common["Authorization"] =
              "Bearer " + localStorage.getItem("access_token");
            return apiInstance(originalRequest);
          }
        });
    }
  }
);

export { dhruvaAPI, apiInstance };
