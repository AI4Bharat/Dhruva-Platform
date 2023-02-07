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
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ASRTry from "../../components/TryOut/ASR";
import TTSTry from "../../components/TryOut/TTS";
import NMTTry from "../../components/TryOut/NMT";
import STSTry from "../../components/TryOut/STS";
import useMediaQuery from "../../hooks/useMediaQuery";
import { dhruvaConfig } from "../../config/config";
import { useState, useEffect } from "react";
import axios from "axios";
import Documentation from "../../components/Documentation/Documentation";
import Head from "next/head";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Service {
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

export default function ViewService() {
  const router = useRouter();
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const [serviceInfo, setServiceInfo] = useState<Service>({
    name: "",
    serviceDescription: "",
    hardwareDescription: "",
    publishedOn: 1,
    modelId: "",
    model: {
      version: "",
      task: { type: "" },
      languages: [],
      inferenceEndPoint: { schema: { request: {}, response: {} } },
    },
  });

  const [languages, setLanguages] = useState<LanguageConfig[]>([]);

  useEffect(() => {
    if (router.isReady) {
      const serviceId = router.query["serviceId"];
      axios({
        method: "POST",
        url: dhruvaConfig.viewService,
        data: {
          serviceId: serviceId,
        },
      }).then((response) => {
        setServiceInfo(response.data);
        setLanguages(response.data["model"]["languages"]);
      });
    }
  }, [router.isReady]);

  const renderTryIt = (taskType: string) => {
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
    }
  };

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
                <Heading>{serviceInfo["name"]}</Heading>
              </Stack>
              <Tabs isFitted>
                <TabList aria-orientation="vertical" mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Documentation</Tab>
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
                    <Documentation serviceInfo={serviceInfo} />
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
                {renderTryIt(serviceInfo["model"]["task"]["type"])}
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
              <Stack spacing={10} direction={"row"}>
                <Heading>{serviceInfo["name"]}</Heading>
              </Stack>
              <Tabs isFitted>
                <TabList mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Documentation</Tab>
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
                    <Documentation serviceInfo={serviceInfo} />
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
                {renderTryIt(serviceInfo["model"]["task"]["type"])}
              </Stack>
            </GridItem>
          </Grid>
        )}
      </ContentLayout>
    </>
  );
}
