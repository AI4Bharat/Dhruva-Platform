import { Box, FormLabel, HStack, Select, Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { listallkeys, listallusers } from "../../api/adminAPI";
import {
  getService,
  listServices,
  listalluserkeys,
} from "../../api/serviceAPI";
import { taskOptions } from "../../components/Utils/Options";
import { lang2label } from "../../config/config";
import useMediaQuery from "../../hooks/useMediaQuery";

const monitoring = () => {
  const [selectedUser, setSelectedUser] = useState<string>(".*");
  const [apiKeyName, setAPIKeyName] = useState<string>(".*");
  const [inferenceServiceId, setInferenceServiceId] = useState<string>(".*");
  const [sourceLanguage, setSourceLanguage] = useState<string>(".*");
  const [targetLanguage, setTargetLanguage] = useState<string>(".*");
  const [taskType, setTaskType] = useState<string>(".*");
  const [filteredServices, setFilteredServices] = useState<ServiceList[]>([]);

  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const { data: userslist } = useQuery(["users"], () => listallusers());
  const { data: serviceslist } = useQuery(["services"], () => listServices(), {
    onSuccess: (data) => {
      setFilteredServices(data);
    },
  });

  const { data: selectedService, refetch: servicerefresh } = useQuery(
    ["keys"],
    () => getService(inferenceServiceId)
  );

  const { data: keyslist, refetch: keyslistrefresh } = useQuery(
    ["keys", selectedUser],
    () => listalluserkeys(inferenceServiceId, selectedUser),
    {
      onSuccess: (data) => {
        data["api_keys"] && setAPIKeyName(data["api_keys"][0].name);
      },
    }
  );

  const { data: keyslist2, refetch: keyslistrefresh2 } = useQuery(
    ["keys", selectedUser],
    () => listallkeys(selectedUser),
    {
      onSuccess: (data) => {
        data["api_keys"] && setAPIKeyName(data["api_keys"][0].name);
      },
    }
  );

  useEffect(() => {
    keyslistrefresh();
    if (selectedUser === ".*") {
      setAPIKeyName(".*");
    }
  }, [selectedUser]);

  useEffect(() => {
    if (inferenceServiceId === ".*") {
      setSourceLanguage(".*");
    } else {
      servicerefresh();
    }
  }, [inferenceServiceId]);

  useEffect(() => {
    keyslistrefresh2();
    if (selectedUser === ".*") {
      setAPIKeyName(".*");
    }
  }, [setInferenceServiceId]);

  useEffect(() => {
    if (taskType == ".*") {
      setFilteredServices(serviceslist);
    } else {
      setFilteredServices(
        serviceslist.filter((service) => service.task.type.includes(taskType))
      );
    }
  }, [taskType]);

  return (
    <>
      <Head>
        <title>Monitoring Dashboard</title>
      </Head>
      <Box ml="1rem" mr="1rem">
        <Box>
          <br></br>
          <br></br>
          <br></br>
          <Stack direction={["column", "row"]} spacing="1rem">
            <HStack>
              <FormLabel>Task:</FormLabel>
              <Select
                background={"white"}
                color={"gray.600"}
                value={taskType}
                minWidth="15rem"
                onChange={(e) => {
                  setTaskType(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {taskOptions}
              </Select>
            </HStack>
          </Stack>
          <br />
          <Stack
            direction={["column", "column", "column", "row"]}
            spacing="1rem"
          >
            '
            <HStack>
              <FormLabel>User:</FormLabel>
              <Select
                background={"white"}
                color={"gray.600"}
                value={selectedUser}
                minWidth="15rem"
                borderRadius={0}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {userslist?.map((user: any) => {
                  return <option value={user._id}>{user.name}</option>;
                })}
              </Select>
            </HStack>
            <HStack>
              <FormLabel>Service:</FormLabel>
              <Select
                background={"white"}
                color={"gray.600"}
                borderRadius={0}
                value={inferenceServiceId}
                minWidth="15rem"
                onChange={(e) => {
                  setInferenceServiceId(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {filteredServices?.map((s: any) => {
                  return <option value={s.serviceId}>{s.name}</option>;
                })}
              </Select>
            </HStack>
            <HStack>
              <FormLabel>API&nbsp;Key:</FormLabel>
              <Select
                background={"white"}
                borderRadius={0}
                color={"gray.600"}
                value={apiKeyName}
                minWidth="15rem"
                onChange={(e) => {
                  setAPIKeyName(e.target.value);
                }}
                //   isDisabled={selectedUser === ".*"}
              >
                <option value=".*">Overall</option>
                {selectedUser !== ".*" ? (
                  inferenceServiceId !== ".*" ? (
                    keyslist &&
                    keyslist["api_keys"]?.map((k: any) => {
                      return <option value={k.name}>{k.name}</option>;
                    })
                  ) : (
                    keyslist2 &&
                    keyslist2["api_keys"]?.map((k: any) => {
                      return <option value={k.name}>{k.name}</option>;
                    })
                  )
                ) : (
                  <></>
                )}
              </Select>
            </HStack>
          </Stack>
          <br></br>
          <Stack direction={["column", "row"]} spacing="1rem">
            <HStack>
              <FormLabel>Source&nbsp;Language:</FormLabel>
              <Select
                background={"white"}
                color={"gray.600"}
                value={sourceLanguage}
                borderRadius={0}
                minWidth="10rem"
                onChange={(e) => {
                  setSourceLanguage(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {Array.from(
                  new Set(
                    selectedService?.model.languages.map(
                      (s: any) => s.sourceLanguage
                    )
                  )
                ).map((language: string) => (
                  <option key={language} value={language}>
                    {lang2label[language]}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack                 
            display={(taskType=="translation"|| taskType=="transliteration")?"flex":"none"}>
            <FormLabel>Target&nbsp;Language:</FormLabel>
              <Select
                background={"white"}
                color={"gray.600"}
                value={targetLanguage}
                borderRadius={0}
                minWidth="10rem"
                onChange={(e) => {
                  setTargetLanguage(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {Array.from(
                  new Set(
                    selectedService?.model.languages.map(
                      (s: any) => s.targetLanguage
                    )
                  )
                ).map((language: string) => (
                  <option key={language} value={language}>
                    {lang2label[language]}
                  </option>
                ))}
              </Select>
            </HStack>
          </Stack>
        </Box>
        <br></br>
        <br></br>
        {smallscreen ? (
          // https://grafana.dhruva.co
          <iframe
            src={`${process.env.NEXT_PUBLIC_GRAFANA_URL}/d/Ye6zPeA7y/dhruva-inference-request-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${selectedUser}&var-inferenceServiceId=${inferenceServiceId}&var-taskType=${taskType}&var-sourceLanguage=${sourceLanguage}&var-targetLanguage=${targetLanguage}&from=now-1h&to=now&kiosk=tv`}
            height={640}
            width={360}
          />
        ) : (
          <iframe
          src={`${process.env.NEXT_PUBLIC_GRAFANA_URL}/d/Ye6zPeA7y/dhruva-inference-request-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${selectedUser}&var-inferenceServiceId=${inferenceServiceId}&var-taskType=${taskType}&var-sourceLanguage=${sourceLanguage}&var-targetLanguage=${targetLanguage}&from=now-1h&to=now&kiosk=tv`}
            width={"95%"}
            height={600}
          />
        )}
        <br></br>
        <br></br>
      </Box>
    </>
  );
};

export default monitoring;
