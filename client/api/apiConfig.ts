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
  // stsInference: `${dhruvaRootURL}/services/inference/s2s`,
  nerInference: `${dhruvaRootURL}/services/inference/ner`,
  pipelineInference: `${dhruvaRootURL}/services/inference/pipeline`,
  xlitInference: `${dhruvaRootURL}/services/inference/transliteration`,
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const apiInstance = axios.create({ baseURL: dhruvaRootURL });

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((subscriber) => subscriber(token));
  refreshSubscribers = [];
}

apiInstance.interceptors.request.use((config: any) => {
  if (window.location.pathname !== "/") {
    localStorage.setItem("current_page", window.location.href);
  }
  config.headers["request-startTime"] = new Date().getTime();
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    config.headers["x-auth-source"] = "AUTH_TOKEN";
  }
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
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refresh_token");
        return axios
          .post(`${dhruvaRootURL}/auth/refresh`, { token: refreshToken })
          .then((res) => {
            if (res.status === 200) {
              localStorage.setItem("access_token", res.data.token);
              apiInstance.defaults.headers.common["Authorization"] =
                "Bearer " + res.data.token;
              onTokenRefreshed(res.data.token);
              return apiInstance(originalRequest);
            }
          })
          .catch((e) => {
            if (window.location.pathname !== "/") {
              window.location.replace("/");
            }
            throw e;
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiInstance(originalRequest));
          });
        });
      }
    } else {
      throw error;
    }
  }
);

export { dhruvaAPI, apiInstance };
