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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
import { SlGraph } from "react-icons/sl";
import Usage from "../../components/Services/Usage";
import { listalluserkeys } from "../../api/serviceAPI";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

function ServicePerformanceModal({ ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user_id = localStorage.getItem("user_id");
  const service_id = props.service_id;
  const { data: keylist } = useQuery(["keys"], () =>
    listalluserkeys(service_id, user_id)
  );
  const [apiKeyName, setAPIKeyName] = useState("");

  useEffect(() => {
    if (keylist) {
      setAPIKeyName(keylist["api_keys"][0]["name"]);
    }
  }, [keylist]);

  return (
    <>
      <Button onClick={onOpen}>
        <SlGraph />
      </Button>

      <Modal isOpen={isOpen} size={"full"} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading>Service Specific Dashboard</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction={"column"}>
              <Stack direction="row">
                <Heading size={"md"}>API Key Name:</Heading>
                {keylist ? (
                  <Select
                    value={apiKeyName}
                    onChange={(e) => {
                      setAPIKeyName(e.target.value);
                    }}
                  >
                    {keylist["api_keys"].map((key) => {
                      return (
                        <option key={key.name} value={key.name}>
                          {key.name}
                        </option>
                      );
                    })}
                  </Select>
                ) : (
                  <></>
                )}
              </Stack>
            </Stack>
            <br />
            <iframe
              src={`https://grafana.dhruva.co/d/Zj4zOgA7y/dhruva-service-specific-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${user_id}&var-inferenceServiceId=${service_id}`}
              width={"100%"}
              height={600}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function ViewService() {
  const router = useRouter();
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: serviceInfo, isLoading } = useQuery(
    ["service", router.query["serviceId"]],
    () => getService(router.query["serviceId"] as string)
  );

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
                <ServicePerformanceModal
                  service_id={router.query["serviceId"]}
                />
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
                  <option value={3}>Usage</option>
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
                <ServicePerformanceModal
                  service_id={router.query["serviceId"]}
                />
              </Stack>
              <Tabs isFitted>
                <TabList mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Documentation</Tab>
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
