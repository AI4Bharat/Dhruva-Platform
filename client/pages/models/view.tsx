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
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import { dhruvaConfig } from "../../config/config";
import axios from "axios";

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

export default function ViewModel() {
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

  useEffect(() => {
    console.log(router.query["modelId"]);
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
  }, [router.isReady]);
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
          </GridItem>
        </Grid>
      )}
    </ContentLayout>
  );
}
