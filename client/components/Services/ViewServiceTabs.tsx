import { HStack, Stack, TabPanel, TabPanels, Text } from "@chakra-ui/react";
import React from "react";
import Documentation from "../Documentation/Documentation";
import Usage from "./Usage";
import ServiceBenchmark from "../Benchmarks/ServiceBenchmark";

const ViewServiceTabs = ({
  serviceInfo,
  languages,
  serviceID,
}: {
  serviceInfo: ServiceView;
  languages: LanguageConfig[];
  serviceID: string | string[];
}) => {
  //  const serviceInfo = props.serviceInfo;
  //  const languages = props.languages;
  //  const serviceID = props.serviceID;
  return (
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
            <HStack>
              <Text className="dview-service-info-item"> Health : </Text>
              {serviceInfo["healthStatus"] ? (
                <Text
                  fontWeight={"bold"}
                  color={
                    serviceInfo["healthStatus"]["status"] == "healthy"
                      ? "green.300"
                      : "red.300"
                  }
                >
                  {serviceInfo["healthStatus"]["status"]}
                </Text>
              ) : (
                <Text color="gray.500">Status Unavailable</Text>
              )}
            </HStack>
            {serviceInfo["healthStatus"] ? (
              <Text className="dview-service-info-item">
                (updated:{" "}
                {new Date(
                  serviceInfo["healthStatus"]["lastUpdated"]
                ).toDateString()}{" "}
                )
              </Text>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      </TabPanel>
      <TabPanel>
        <Documentation serviceInfo={serviceInfo} />
      </TabPanel>
      <TabPanel>
        <Usage
          serviceID={serviceID as string}
          type={serviceInfo["model"]["task"]["type"]}
        />
      </TabPanel>
      <TabPanel>
        <ServiceBenchmark benchmarks={serviceInfo["benchmarks"]} />
      </TabPanel>
    </TabPanels>
  );
};

export default ViewServiceTabs;
