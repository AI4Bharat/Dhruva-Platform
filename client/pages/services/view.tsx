import {
  Box,
  Button,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tab,
  TabList,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { SlGraph } from "react-icons/sl";
import { listallusers } from "../../api/adminAPI";
import { getService, listalluserkeys } from "../../api/serviceAPI";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ServicePerformanceModal from "../../components/Services/ServicePerformanceModal";
import ViewServiceTabs from "../../components/Services/ViewServiceTabs";
import ASRTry from "../../components/TryOut/ASR";
import NERTry from "../../components/TryOut/NER";
import NMTTry from "../../components/TryOut/NMT";
// import STSTry from "../../components/TryOut/STS";
import TTSTry from "../../components/TryOut/TTS";
import XLITTry from "../../components/TryOut/XLIT";
import useMediaQuery from "../../hooks/useMediaQuery";

export default function ViewService() {
  const router = useRouter();
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: serviceInfo, isLoading } = useQuery(
    ["service", router.query["serviceId"]],
    () => getService(router.query["serviceId"] as string),
    { enabled: router.isReady }
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
      const serviceId = router.query["serviceId"] as string;
      switch (taskType) {
        case "asr":
          return <ASRTry languages={languages} serviceId={serviceId} />;
        case "tts":
          return <TTSTry languages={languages} serviceId={serviceId} />;
        case "translation":
          return <NMTTry languages={languages} serviceId={serviceId} />;
        // case "sts":
        //   return <STSTry languages={languages} serviceId={serviceId} />;
        case "ner":
          return <NERTry languages={languages} serviceId={serviceId} />;
        case "transliteration":
          return <XLITTry languages={languages} serviceId={serviceId} />;
      }
    }
  };

  if (isLoading || !serviceInfo) return;

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
              <Button
                variant={"link"}
                mb="1rem"
                onClick={() => router.push("/services")}
              >
                <HiArrowLeft /> &nbsp;Services
              </Button>
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
                  <option value={2}>Usage</option>
                  <option value={3}>Performance</option>
                </Select>
                <ViewServiceTabs
                  languages={languages}
                  serviceID={router.query["serviceId"]}
                  serviceInfo={serviceInfo}
                />
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
                <Button
                  variant={"ghost"}
                  fontSize={"2xl"}
                  onClick={() => router.push("/services")}
                >
                  <HiArrowLeft />
                </Button>
                <Heading>{serviceInfo["name"]}</Heading>
                <ServicePerformanceModal
                  service_id={router.query["serviceId"]}
                />
              </Stack>
              <Tabs isFitted>
                <TabList mb="1em">
                  <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Documentation</Tab>
                  <Tab _selected={{ textColor: "#DD6B20" }}>Usage</Tab>
                  {serviceInfo["benchmarks"] === null ? (
                    <></>
                  ) : (
                    <Tab _selected={{ textColor: "#DD6B20" }}>Performance</Tab>
                  )}
                </TabList>
                <ViewServiceTabs
                  languages={languages}
                  serviceID={router.query["serviceId"]}
                  serviceInfo={serviceInfo}
                />
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
