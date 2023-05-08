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
  Spacer,
  Stack,
  Tab,
  TabList,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SlGraph } from "react-icons/sl";
import { getService, listalluserkeys } from "../../api/serviceAPI";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ViewServiceTabs from "../../components/Services/ViewServiceTabs";
import ASRTry from "../../components/TryOut/ASR";
import NERTry from "../../components/TryOut/NER";
import NMTTry from "../../components/TryOut/NMT";
import STSTry from "../../components/TryOut/STS";
import TTSTry from "../../components/TryOut/TTS";
import XLITTry from "../../components/TryOut/XLIT";
import useMediaQuery from "../../hooks/useMediaQuery";
import { dhruvaAPI } from "../../api/apiConfig";
import axios from "axios";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import {listallusers } from "../../api/adminAPI";

function ServicePerformanceModal({ ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const service_id = props.service_id;

  const [selectedUser, setSelectedUser] = useState<string>(".*")
  const [apiKeyName, setAPIKeyName] = useState<string>(".*");

  const { data: userslist } = useQuery(["users"], () => listallusers());

  const { data: keyslist, refetch: keyslistrefresh, isSuccess } = useQuery(
    ["keys", selectedUser],
    () => listalluserkeys(service_id ,selectedUser),{onSuccess:data =>{setAPIKeyName(data["api_keys"][0].name)}}
  );

  useEffect(() => {
    keyslistrefresh();
    if(selectedUser === ".*")
    {
      setAPIKeyName(".*")
    }
  }, [selectedUser]);

  
  return (
    <>
      <Button onClick={onOpen}>
        <SlGraph />
      </Button>

      <Modal isOpen={isOpen} size="8xl" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading>Dashboard</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction={["column","row"]} spacing="1rem">
              <HStack >
                <FormLabel>User:</FormLabel>
                <Select value={selectedUser}  minWidth="15rem" onChange={e=>{setSelectedUser(e.target.value)}}>
                  <option value=".*">Overall</option>
                  {
                    userslist?.map((user: any) => {
                      return <option value={user._id}>{user.name}</option>;
                    })
                  }
                </Select>
              </HStack>
              <HStack>
              <FormLabel>API&nbsp;Key:</FormLabel>
                <Select value={apiKeyName} minWidth="15rem" onChange={e=>{setAPIKeyName(e.target.value)}} isDisabled={selectedUser === ".*"}>
                  {
                    selectedUser !== ".*"?
                    keyslist&&
                    keyslist["api_keys"]?.map((k: any) => {
                      return <option value={k.name}>{k.name}</option>;
                    })
                    :
                    <></>
                  }
                </Select>
              </HStack>
            </Stack>
            <br />
            {/* {apiKeyName}
            <br/>
            {selectedUser}
            <br/>
            {service_id}
            <br/> */}
            <iframe
              src={`${process.env.NEXT_PUBLIC_GRAFANA_URL}/d/Zj4zOgA7y/dhruva-service-specific-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${selectedUser}&var-inferenceServiceId=${service_id}&from=now-1h&to=now&kiosk=tv`}
              width={"100%"}
              height={600}
            />
          </ModalBody>

          <ModalFooter>
            <Button  mr={3} onClick={onClose}>
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
    () => getService(router.query["serviceId"] as string),
    { enabled: router.isReady }
  );

  const [languages, setLanguages] = useState<LanguageConfig[]>();
  const [tabIndex, setTabIndex] = useState<number>(0);

  useEffect(() => {
    if (serviceInfo) {
      setLanguages(serviceInfo["model"]["languages"]);
      console.log(serviceInfo);
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
        case "sts":
          return <STSTry languages={languages} serviceId={serviceId} />;
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
