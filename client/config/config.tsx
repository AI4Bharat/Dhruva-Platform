import { createContext } from "react";
import axios, { AxiosHeaders, AxiosRequestConfig } from "axios";

const dhruvaRootURL: string = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const dhruvaConfig: { [key: string]: string } = {
  listServices: `${dhruvaRootURL}/services/details/list_services`,
  viewService: `${dhruvaRootURL}/services/details/view_service`,
  listModels: `${dhruvaRootURL}/services/details/list_models`,
  viewModel: `${dhruvaRootURL}/services/details/view_model`,
  genericInference: `${dhruvaRootURL}/services/inference`,
  translationInference: `${dhruvaRootURL}/services/inference/translation`,
  ttsInference: `${dhruvaRootURL}/services/inference/tts`,
  asrInference: `${dhruvaRootURL}/services/inference/asr`,
  asrStreamingInference: `wss://api.dhruva.ai4bharat.org`,
};

const lang2label: { [key: string]: string } = {
  hi: "Hindi",
  ta: "Tamil",
  en: "English",
  te: "Telugu",
  as: "Assamese",
  bn: "Bengali",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  or: "Oriya",
  gu: "Gujarati",
  raj: "Rajasthani",
  ur: "Urdu",
  sa: "Sanskrit",
  brx: "Bodo",
  mni: "Manipuri",
};

const apiInstance = axios.create();

apiInstance.interceptors.request.use((config: any) => {
  config.headers["request-startTime"] = new Date().getTime();
  return config;
});

apiInstance.interceptors.response.use((response: any) => {
  const currentTime = new Date().getTime();
  const startTime = response.config.headers["request-startTime"];
  response.headers["request-duration"] = currentTime - startTime;
  return response;
});

export { dhruvaConfig, lang2label, apiInstance };
