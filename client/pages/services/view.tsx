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
  OrderedList,
  ListItem,
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ASRTry from "../../components/TryOut/ASR";
import TTSTry from "../../components/TryOut/TTS";
import NMTTry from "../../components/TryOut/NMT";
import useMediaQuery from "../../hooks/useMediaQuery";

import { useState, useEffect } from "react";

import axios from "axios";

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
        url: "https://api.dhruva.co/services/details/view_service",
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
    }
  };

  return (
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
                  <OrderedList spacing={7.5}>
                    <ListItem>
                      {" "}
                      Modify the request Schema for{" "}
                      {serviceInfo["model"]["task"][
                        "type"
                      ].toLocaleUpperCase()}{" "}
                      task.
                    </ListItem>
                    <pre
                      style={{
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        whiteSpace: "pre-wrap",
                        borderRadius: 15,
                      }}
                    >
                      {JSON.stringify(
                        {
                          serviceId: router.query["serviceId"],
                          input:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["input"],
                          config:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["config"],
                          audio:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["audio"],
                        },
                        null,
                        1
                      )}
                    </pre>
                    <ListItem>
                      Using the above payload schema hit the{" "}
                      {serviceInfo["model"]["task"]["type"].toLocaleUpperCase()}{" "}
                      inference URL at
                      <Text color={"blue"}>
                        https://api.dhruva.co/services/inference
                      </Text>
                    </ListItem>
                    <ListItem>
                      If the request is a success, the response will be in the
                      format given below.
                    </ListItem>
                    <pre
                      style={{
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        whiteSpace: "pre-wrap",
                        borderRadius: 15,
                        textOverflow: "ellipsis",
                        width: 350,
                      }}
                    >
                      {JSON.stringify(
                        serviceInfo.model.inferenceEndPoint["schema"][
                          "response"
                        ],
                        null,
                        1
                      )}
                    </pre>
                  </OrderedList>
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
                  <OrderedList spacing={7.5}>
                    <ListItem>
                      {" "}
                      Modify the request Schema for{" "}
                      {serviceInfo["model"]["task"][
                        "type"
                      ].toLocaleUpperCase()}{" "}
                      task.
                    </ListItem>
                    <pre
                      style={{
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        whiteSpace: "pre-wrap",
                        borderRadius: 15,
                      }}
                    >
                      {JSON.stringify(
                        {
                          serviceId: router.query["serviceId"],
                          input:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["input"],
                          config:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["config"],
                          audio:
                            serviceInfo.model.inferenceEndPoint["schema"][
                              "request"
                            ]["audio"],
                        },
                        null,
                        1
                      )}
                    </pre>
                    <ListItem>
                      Using the above payload schema hit the{" "}
                      {serviceInfo["model"]["task"]["type"].toLocaleUpperCase()}{" "}
                      inference URL at
                      <Text color={"blue"}>
                        https://api.dhruva.co/services/inference
                      </Text>
                    </ListItem>
                    <ListItem>
                      If the request is a success, the response will be in the
                      format given below.
                    </ListItem>
                    <pre
                      style={{
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        whiteSpace: "pre-wrap",
                        borderRadius: 15,
                        textOverflow: "ellipsis",
                        width: 350,
                      }}
                    >
                      {JSON.stringify(
                        serviceInfo.model.inferenceEndPoint["schema"][
                          "response"
                        ],
                        null,
                        1
                      )}
                    </pre>
                  </OrderedList>
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
  );
}
