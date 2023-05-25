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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { getModel } from "../../api/modelAPI";
import { HiArrowLeft } from "react-icons/hi";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Benchmark {
  benchmarkId: string;
  name: string;
  description: string;
  domain: string;
  createdOn: number;
  languages: {
    sourceLanguage: string;
    targetLanguage: string;
  };
  score: [
    {
      metricName: string;
      score: string;
    }
  ];
}

export default function ViewModel({ ...props }) {
  const router = useRouter();
  const { data: modelInfo, isLoading } = useQuery(
    ["model", router.query["modelId"]],
    () => getModel(router.query["modelId"])
  );
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<string[]>([]);
  const [benchmarkMetric, setBenchmarkMetric] = useState<string>("");
  const [benchmarkDatasets, setBenchmarkDatasets] = useState<string[]>([]);
  const [benchmarkDataset, setBenchmarkDataset] = useState<string>("");
  const [benchmarkValues, setBenchmarkValues] = useState<Benchmark[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);

  useEffect(() => {
    if (modelInfo !== undefined) {
      setBenchmarks(modelInfo.benchmarks);
    }
  }, [modelInfo]);

  useEffect(() => {
    if (benchmarks) {
      const metrics = new Set();
      const datasets = new Set();
      benchmarks.forEach((benchmark) => {
        benchmark["score"].forEach((score) => {
          metrics.add(score["metricName"]);
        });
        datasets.add(benchmark["name"]);
      });
      const currentBenchmarkDatasets = Array.from(datasets) as string[];
      const currentBenchmarkMetrics = Array.from(metrics) as string[];
      setBenchmarkMetrics(currentBenchmarkMetrics);
      setBenchmarkMetric(currentBenchmarkMetrics[0]);
      setBenchmarkDatasets(currentBenchmarkDatasets);
      setBenchmarkDataset(currentBenchmarkDatasets[0]);
    }
  }, [benchmarks]);

  useEffect(() => {
    const currentBenchmarks = benchmarks.filter(
      (benchmark) => benchmark["name"] === benchmarkDataset
    );

    const currentMetricBenchmarks = [];
    currentBenchmarks.forEach((benchmark) => {
      benchmark["score"].forEach((score) => {
        if (score["metricName"] === benchmarkMetric) {
          const benchmarkObj = {};
          benchmarkObj["value"] = benchmark["score"][0]["score"];
          benchmarkObj["language"] = benchmark["languages"]["targetLanguage"]
            ? `${benchmark["languages"]["sourceLanguage"]}-${benchmark["languages"]["targetLanguage"]}`
            : benchmark["languages"]["sourceLanguage"];
          currentMetricBenchmarks.push(benchmarkObj);
        }
      });
    });

    setBenchmarkValues(currentMetricBenchmarks);
  }, [benchmarkMetric, benchmarkDataset]);

  if (isLoading) {
    return <div>Loading</div>;
  }

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
            <Button variant={"link"} mb="1rem" onClick={()=>router.push("/services")}><HiArrowLeft/> &nbsp;Models</Button>
              <Stack spacing={10} direction={"row"}>
                <Heading>{modelInfo["name"]}</Heading>
              </Stack>
              <br />
              <Tabs index={tabIndex} isFitted>
                <Select
                  defaultValue={0}
                  onChange={(e) => setTabIndex(parseInt(e.target.value))}
                >
                  <option value={0}>Details</option>
                </Select>
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
              <Stack spacing={2.5}>
                <Box m="1rem" className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Benchmarks
                  </Heading>
                </Box>
                {benchmarks ? (
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
                        {benchmarkMetrics.map((metric) => {
                          return (
                            <option key={metric} value={metric}>
                              {metric.toUpperCase()}
                            </option>
                          );
                        })}
                      </Select>
                    </Stack>
                    <Stack direction={"row"}>
                      <Text className="dview-service-try-option-title">
                        Dataset :{" "}
                      </Text>
                      <Select
                        value={benchmarkDataset}
                        onChange={(e) => {
                          setBenchmarkDataset(e.target.value);
                        }}
                      >
                        {benchmarkDatasets.map((dataset) => {
                          return (
                            <option key={dataset} value={dataset}>
                              {dataset.toUpperCase()}
                            </option>
                          );
                        })}
                      </Select>
                    </Stack>
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
                      {benchmarkValues.map((benchmark, idx) => {
                        return (
                          <Stat key={idx}>
                            <StatLabel>
                              {benchmarkMetric.toUpperCase()} Score
                            </StatLabel>
                            <StatNumber>{benchmark["value"]}</StatNumber>
                            <StatHelpText>{benchmark["language"]}</StatHelpText>
                          </Stat>
                        );
                      })}
                    </SimpleGrid>
                  </Stack>
                ) : (
                  <Box
                    borderRadius={15}
                    height={100}
                    width="auto"
                    bg={"orange.100"}
                    display="flex"
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Text fontWeight={"bold"}>No Benchmarks Found.</Text>
                  </Box>
                )}
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
              <Button variant={"ghost"} fontSize={"2xl"} onClick={()=>router.push("/services")}><HiArrowLeft/></Button>
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
              <Stack spacing={2.5}>
                <Box m="1rem" className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Benchmarks
                  </Heading>
                </Box>
                {benchmarks ? (
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
                        {benchmarkMetrics.map((metric) => {
                          return (
                            <option key={metric} value={metric}>
                              {metric.toUpperCase()}
                            </option>
                          );
                        })}
                      </Select>
                    </Stack>
                    <Stack direction={"row"}>
                      <Text className="dview-service-try-option-title">
                        Dataset :{" "}
                      </Text>
                      <Select
                        value={benchmarkDataset}
                        onChange={(e) => {
                          setBenchmarkDataset(e.target.value);
                        }}
                      >
                        {benchmarkDatasets.map((dataset) => {
                          return (
                            <option key={dataset} value={dataset}>
                              {dataset.toUpperCase()}
                            </option>
                          );
                        })}
                      </Select>
                    </Stack>
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
                      {benchmarkValues.map((benchmark) => {
                        return (
                          <Stat>
                            <StatLabel>
                              {benchmarkMetric.toUpperCase()} Score
                            </StatLabel>
                            <StatNumber>{benchmark["value"]}</StatNumber>
                            <StatHelpText>{benchmark["language"]}</StatHelpText>
                          </Stat>
                        );
                      })}
                    </SimpleGrid>
                  </Stack>
                ) : (
                  <Box
                    borderRadius={15}
                    height={100}
                    width="auto"
                    bg={"orange.100"}
                    display="flex"
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Text fontWeight={"bold"}>No Benchmarks Found.</Text>
                  </Box>
                )}
              </Stack>
            </GridItem>
          </Grid>
        )}
      </ContentLayout>
    </>
  );
}
