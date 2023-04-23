import { useRouter } from "next/router";
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
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ASRTry from "../../components/TryOut/ASR";
import TTSTry from "../../components/TryOut/TTS";
import NMTTry from "../../components/TryOut/NMT";
import STSTry from "../../components/TryOut/STS";
import NERTry from "../../components/TryOut/NER";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useState, useEffect } from "react";
import Documentation from "../../components/Documentation/Documentation";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { getService } from "../../api/serviceAPI";
import Feedback from "../../components/Feedback/Feedback";
import Usage from "../../components/Services/Usage";
import ServiceBenchmark from "../../components/Benchmarks/ServiceBenchmark";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function ViewService() {
  const router = useRouter();
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const { data: serviceInfo, isLoading } = useQuery({
    queryKey: ["service", router.query["serviceId"]],
    queryFn: () => getService(router.query["serviceId"] as string),
    enabled: router.isReady,
  });

  const [languages, setLanguages] = useState<LanguageConfig[]>();
  const [tabIndex, setTabIndex] = useState<number>(0);

  useEffect(() => {
    if (serviceInfo) {
      setLanguages(serviceInfo["model"]["languages"]);
    }
  }, [serviceInfo]);

  const renderTryIt = (taskType: string) => {
    if (languages) {
      const serviceId = router.query["serviceId"];
      switch (taskType) {
        case "asr":
          return <ASRTry languages={languages} serviceId={serviceId} />;
        case "tts":
          return <TTSTry languages={languages} serviceId={serviceId} />;
        case "translation":
          return <NMTTry languages={languages} serviceId={serviceId} />;
        case "sts":
          return <STSTry languages={languages} serviceId={serviceId} />;
        case "ner":
          return <NERTry languages={languages} serviceId={serviceId} />;
      }
    }
  };

  if (isLoading || !serviceInfo) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>View Service</title>
      </Head>
      <ContentLayout>
        {smallscreen ? (
          <Grid
            ml="1rem"
            mr="1rem"
            mb="1rem"
            minW={"90vw"}
            maxW={"90vw"}
            gap={10}
          >
            <GridItem p="1rem" bg="white">
              <Stack spacing={10} direction={"row"}>
                <Heading>{serviceInfo["name"]}</Heading>
              </Stack>
              <br />
              <Tabs index={tabIndex} isFitted>
                <Select
                  defaultValue={0}
                  onChange={(e) => setTabIndex(parseInt(e.target.value))}
                >
                  <option value={0}>Details</option>
                  <option value={1}>Documentation</option>
                  <option value={2}>Feedback</option>
                  <option value={3}>Performance</option>
                  <option value={4}>Usage</option>
                </Select>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={5}>
                      <Text className="dview-service-description">
                        {serviceInfo["serviceDescription"]}
                      </Text>
                      <Stack>
                        <Text className="dview-service-info-item">
                          Model Version : {serviceInfo["model"]["version"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Model Type : {serviceInfo["model"]["task"]["type"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Running On : {serviceInfo["hardwareDescription"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Published On :{" "}
                          {new Date(serviceInfo["publishedOn"]).toDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Documentation serviceInfo={serviceInfo} />
                  </TabPanel>

                  <TabPanel>
                    {languages ? (
                      <Feedback
                        serviceID={router.query["serviceId"]}
                        userID={"john_doe_dummy_id"}
                        serviceLanguages={languages}
                      />
                    ) : (
                      <></>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {serviceInfo["benchmarks"] !== null &&
                    serviceInfo["benchmarks"] !== undefined ? (
                      <ServiceBenchmark
                        benchmarks={serviceInfo["benchmarks"]}
                        modelType={serviceInfo["model"]["task"]["type"]}
                      />
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
                  </TabPanel>
                  <TabPanel>
                    <Usage serviceID={router.query["serviceId"]} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GridItem>
            <GridItem p="1rem" bg="white">
              <Stack spacing={10}>
                <Box className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Try it out here!
                  </Heading>
                </Box>
                {languages && renderTryIt(serviceInfo["model"]["task"]["type"])}
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
            <GridItem>
              <Stack spacing={10} direction={"row"} mb="1rem">
                <Heading>{serviceInfo["name"]}</Heading>
              </Stack>
              <Tabs isFitted>
                <TabList mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Documentation</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Performance</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Feedback</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Usage</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={5}>
                      <Text className="dview-service-description">
                        {serviceInfo["serviceDescription"]}
                      </Text>
                      <Stack>
                        <Text className="dview-service-info-item">
                          Model Version : {serviceInfo["model"]["version"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Model Type : {serviceInfo["model"]["task"]["type"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Running On : {serviceInfo["hardwareDescription"]}
                        </Text>
                        <Text className="dview-service-info-item">
                          Published On :{" "}
                          {new Date(serviceInfo["publishedOn"]).toDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Documentation
                      serviceInfo={serviceInfo}
                      userID={"john_doe_dummy_id"}
                    />
                  </TabPanel>
                  <TabPanel>
                    {serviceInfo["benchmarks"] !== null &&
                    serviceInfo["benchmarks"] !== undefined ? (
                      <ServiceBenchmark
                        benchmarks={serviceInfo["benchmarks"]}
                        modelType={serviceInfo["model"]["task"]["type"]}
                      />
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
                  </TabPanel>
                  <TabPanel>
                    {languages ? (
                      <Feedback
                        serviceID={router.query["serviceId"]}
                        userID={"john_doe_dummy_id"}
                        serviceLanguages={languages}
                      />
                    ) : (
                      <></>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <Usage serviceID={router.query["serviceId"]} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GridItem>
            <GridItem>
              <Stack spacing={10}>
                <Box className="dview-service-try-title-box">
                  <Heading className="dview-service-try-title">
                    Try it out here!
                  </Heading>
                </Box>
                {languages && renderTryIt(serviceInfo["model"]["task"]["type"])}
              </Stack>
            </GridItem>
          </Grid>
        )}
      </ContentLayout>
    </>
  );
}
