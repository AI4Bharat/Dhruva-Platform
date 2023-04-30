interface ServiceList {
  serviceId: string;
  name: string;
  serviceDescription: string;
  hardwareDescription: string;
  publishedOn: number;
  modelId: string;
  task: any;
  languages: any;
}
interface ServiceView {
  name: string;
  serviceDescription: string;
  hardwareDescription: string;
  publishedOn: number;
  modelId: string;
  model: {
    version: string;
    task: { type: string };
    languages: LanguageConfig[];
    inferenceEndPoint: {
      schema: {
        request: any;
        response: any;
      };
    };
  };
}

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}
