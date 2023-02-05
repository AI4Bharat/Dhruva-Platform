import {
  Box,
  Heading,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Grid,
  GridItem,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import { dhruvaConfig, lang2label } from "../../config/config";
import axios from "axios";
import Head from "next/head";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Model {
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
}

interface BenchmarkDataset {
  name: string;
  values: any;
  meta: {
    direction: string;
  };
}

interface Benchmark {
  metric: string;
  datasets: BenchmarkDataset[];
}

export default function ViewModel({ ...props }) {
  const router = useRouter();
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const [modelInfo, setModelInfo] = useState<Model>({
    modelId: "",
    version: "",
    submittedOn: 1,
    updatedOn: 1,
    name: "",
    description: "",
    refUrl: "",
    task: {
      type: "",
    },
    languages: [],
  });

  const [benchmarkMetric, setBenchmarkMetric] = useState<string>("");
  const [benchmarkDatasets, setBenchmarkDatasets] = useState<
    BenchmarkDataset[]
  >([]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    {
      metric: "bleu",
      datasets: [
        {
          name: "WAT2021",
          values: {
            bn: "29.6",
            gu: "40.3",
            hi: "43.9",
            kn: "36.4",
            ml: "34.6",
            mr: "33.5",
            or: "34.4",
            pa: "43.2",
            ta: "33.2",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "WAT2020",
          values: {
            te: "36.2",
            bn: "20",
            gu: "24.1",
            hi: "23.6",
            ml: "20.4",
            mr: "20.4",
            ta: "18.3",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "WMT",
          values: {
            te: "18.5",
            hi: "29.7",
            gu: "25.1",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "UFAL",
          values: {
            ta: "24.1",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "PMI",
          values: {
            ta: "30.2",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "FLORES-101",
          values: {
            bn: "",
            gu: "",
            hi: "",
            kn: "",
            ml: "",
            mr: "",
            or: "",
            pa: "",
            ta: "",
            te: "",
          },
          meta: {
            direction: "IN-EN",
          },
        },
        {
          name: "WAT2021",
          values: {
            bn: "15.3",
            gu: "25.6",
            hi: "38.6",
            kn: "19.1",
            ml: "14.7",
            mr: "20.1",
            or: "18.9",
            pa: "33.1",
            ta: "13.5",
          },
          meta: {
            direction: "EN-IN",
          },
        },
        {
          name: "WAT2020",
          values: {
            te: "36.2",
            bn: "20",
            gu: "24.1",
            hi: "23.6",
            ml: "20.4",
            mr: "20.4",
            ta: "18.3",
          },
          meta: {
            direction: "EN-IN",
          },
        },
        {
          name: "WMT",
          values: {
            te: "18.5",
            hi: "29.7",
            gu: "25.1",
          },
          meta: {
            direction: "EN-IN",
          },
        },
        {
          name: "UFAL",
          values: {
            ta: "24.1",
          },
          meta: {
            direction: "EN-IN",
          },
        },
        {
          name: "PMI",
          values: {
            ta: "30.2",
          },
          meta: {
            direction: "EN-IN",
          },
        },
        {
          name: "FLORES-101",
          values: {
            bn: "",
            gu: "",
            hi: "",
            kn: "",
            ml: "",
            mr: "",
            or: "",
            pa: "",
            ta: "",
            te: "",
          },
          meta: {
            direction: "EN-IN",
          },
        },
      ],
    },
  ]);

  useEffect(() => {
    if (router.isReady) {
      const modelId = router.query["modelId"];
      axios({
        method: "POST",
        url: dhruvaConfig.viewModel,
        data: {
          modelId: modelId,
        },
      }).then((response) => {
        setModelInfo(response.data);
      });
    }
    const initialBenchmarkMetric = benchmarks[0]["metric"];
    setBenchmarkMetric(initialBenchmarkMetric);
  }, [router.isReady]);

  useEffect(() => {
    if (benchmarkMetric !== "") {
      const currentBenchmarks = benchmarks.filter(
        (benchmark) => benchmark["metric"] === benchmarkMetric
      );
      const currentBenchmarkDatasets = currentBenchmarks[0]["datasets"];
      setBenchmarkDatasets(currentBenchmarkDatasets);
    }
  }, [benchmarkMetric]);

  return (
    <>
      {" "}
      <Head>
        <title>View Model</title>
      </Head>{" "}
      <ContentLayout>
        {smallscreen ? (
          <Grid
            ml="1rem"
            mr="1rem"
            mb="1rem"
            pl="1rem"
            pr="1rem"
            pt="1rem"
            pb="1rem"
            minH={"10vh"}
            minW={"90vw"}
            maxW={"90vw"}
            gap={10}
          >
            <GridItem p="1rem" bg="white">
              <Stack spacing={10} direction={"row"}>
                <Heading>{modelInfo["name"]}</Heading>
              </Stack>
              <Tabs isFitted>
                <TabList aria-orientation="vertical" mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={5}>
                      <Text className="dview-service-description">
                        {modelInfo["description"]}
                      </Text>
                      <Stack>
                        <Text className="dview-service-info-item">
                          Model Version : {modelInfo["version"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Model Type : {modelInfo["task"]["type"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Submitted On :{" "}
                          {new Date(modelInfo["submittedOn"]).toDateString()}
                        </Text>
                        <Text className="dview-service-info-item">
                          Updated On :{" "}
                          {new Date(modelInfo["updatedOn"]).toDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GridItem>
            <GridItem p="1rem" bg="white">
              <Stack spacing={10}>
                <Box className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Benchmarks
                  </Heading>
                </Box>
              </Stack>
            </GridItem>
          </Grid>
        ) : (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={5}
            className="service-view"
            bg="light.100"
          >
            <GridItem p="1rem" bg="white">
              <Stack spacing={10} direction={"row"}>
                <Heading>{modelInfo["name"]}</Heading>
              </Stack>
              <Tabs isFitted>
                <TabList aria-orientation="vertical" mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={5}>
                      <Text className="dview-service-description">
                        {modelInfo["description"]}
                      </Text>
                      <Stack>
                        <Text className="dview-service-info-item">
                          Model Version : {modelInfo["version"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Model Type : {modelInfo["task"]["type"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Submitted On :{" "}
                          {new Date(modelInfo["submittedOn"]).toDateString()}
                        </Text>
                        <Text className="dview-service-info-item">
                          Updated On :{" "}
                          {new Date(modelInfo["updatedOn"]).toDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GridItem>
            <GridItem p="1rem" bg="white">
              <Stack spacing={10}>
                <Box className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Benchmarks
                  </Heading>
                </Box>
              </Stack>
              <Stack spacing={5}>
                <Stack direction={"row"}>
                  <Text className="dview-service-try-option-title">
                    Metric :{" "}
                  </Text>
                  <Select
                    value={benchmarkMetric}
                    onChange={(e) => {
                      setBenchmarkMetric(e.target.value);
                    }}
                  >
                    {benchmarks.map((obj: Benchmark) => {
                      return (
                        <option key={obj["metric"]} value={obj["metric"]}>
                          {obj["metric"].toUpperCase()}
                        </option>
                      );
                    })}
                  </Select>
                </Stack>
                <Accordion defaultIndex={[0]} overflow={"hidden"} allowMultiple>
                  {benchmarkDatasets.map((dataset) => {
                    return (
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box as="span" flex="1" textAlign="left">
                              {dataset["meta"]
                                ? `${dataset["name"]}-${dataset["meta"]["direction"]}`
                                : dataset["name"]}
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <SimpleGrid
                            p="1rem"
                            w="100%"
                            h="auto"
                            bg="orange.100"
                            borderRadius={15}
                            columns={2}
                            spacingX="40px"
                            spacingY="20px"
                          >
                            {Object.entries(dataset["values"]).map(
                              ([language, score]) => {
                                return (
                                  <Stat>
                                    <StatLabel>
                                      {lang2label[language]}
                                    </StatLabel>
                                    <StatNumber>{score as string}</StatNumber>
                                  </Stat>
                                );
                              }
                            )}
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </Stack>
            </GridItem>
          </Grid>
        )}
      </ContentLayout>
    </>
  );
}
