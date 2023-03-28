interface ModelList {
  name: string;
  version: string;
  modelId: string;
  task: any;
  languages: any;
}

interface ModelView {
  modelId: string;
  version: string;
  submittedOn: number;
  updatedOn: number;
  name: string;
  description: string;
  refUrl: string;
  task: {
    type: string;
  };
  languages: LanguageConfig[];
  benchmarks: Benchmark[];
}
