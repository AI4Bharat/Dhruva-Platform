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
  Button,
} from "@chakra-ui/react";
import ContentLayout from "../../components/Layouts/ContentLayout";
import ASRTry from "../../components/TryOut/ASR";
import TTSTry from "../../components/TryOut/TTS";
import NMTTry from "../../components/TryOut/NMT";

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
  };
}

export default function ViewService() {
  const router = useRouter();
  const [serviceInfo, setServiceInfo] = useState<Service>({
    name: "",
    serviceDescription: "",
    hardwareDescription: "",
    publishedOn: 1,
    modelId: "",
    model: { version: "", task: { type: "" }, languages: [] },
  });

  const [languages, setLanguages] = useState<LanguageConfig[]>([]);

  useEffect(() => {
    if (router.isReady) {
      const serviceId = router.query["serviceId"];
      axios({
        method: "POST",
        url: "https://api.dhruva.co/services/view",
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
      <Box className="service-view">
        <Box className="dview-box dview-box-about">
          <Stack spacing={10}>
            <Stack spacing={10} direction={"row"}>
              <Heading>{serviceInfo["name"]}</Heading>
            </Stack>

            <Tabs isFitted>
              <TabList mb="1em">
                <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
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
              </TabPanels>
            </Tabs>
          </Stack>
        </Box>
        <Box className="dview-box dview-box-try">
          <Stack spacing={10}>
            <Box className="dview-service-try-title-box">
              <Heading className="dview-service-try-title">
                Try it out here!
              </Heading>
            </Box>
            {renderTryIt(serviceInfo["model"]["task"]["type"])}
          </Stack>
        </Box>
      </Box>
    </ContentLayout>
  );
}
