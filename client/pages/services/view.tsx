import {
  Box,
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  TabList,
  Tab,
  Grid,
  GridItem,
  Select,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { SlGraph } from "react-icons/sl";
import { getService, listalluserkeys } from "../../api/serviceAPI";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ASRTry from "../../components/TryOut/ASR";
import NERTry from "../../components/TryOut/NER";
import NMTTry from "../../components/TryOut/NMT";
import STSTry from "../../components/TryOut/STS";
import TTSTry from "../../components/TryOut/TTS";
import useMediaQuery from "../../hooks/useMediaQuery";
import { dhruvaAPI } from "../../api/apiConfig";
import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import ViewServiceTabs from "../../components/Services/ViewServiceTabs";
import { useQuery } from "@tanstack/react-query";


function ServicePerformanceModal({ ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user_id = localStorage.getItem("user_id");
  const [userId, setUserId] = useState(user_id);
  const service_id = props.service_id;
  const { data: keylist } = useQuery(["keys"], () =>
    listalluserkeys(service_id, userId)
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
                      if (e.target.value === ".*") {
                        setUserId(".*");
                      } else {
                        setUserId(user_id);
                      }
                      setAPIKeyName(e.target.value);
                    }}
                  >
                    <option key={"overall"} value=".*">
                      Overall
                    </option>
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
              src={`${process.env.NEXT_PUBLIC_GRAFANA_URL}/d/Zj4zOgA7y/dhruva-service-specific-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${userId}&var-inferenceServiceId=${service_id}&from=now-1h&to=now&kiosk=tv`}
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

  if (isLoading || !serviceInfo) return ;

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
                <ViewServiceTabs languages={languages} serviceID={router.query["serviceId"]} serviceInfo={serviceInfo}/>
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
                <ViewServiceTabs languages={languages} serviceID={router.query["serviceId"]} serviceInfo={serviceInfo}/>
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
