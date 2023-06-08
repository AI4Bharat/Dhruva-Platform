import { Box, FormLabel, HStack, Select, Stack, useMediaQuery } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { setLazyProp } from "next/dist/server/api-utils";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { listallkeys, listallusers } from "../../api/adminAPI";
import { listalluserkeys, listServices } from "../../api/serviceAPI";

const monitoring = () => {
  const [selectedUser, setSelectedUser] = useState<string>(".*");
  const [apiKeyName, setAPIKeyName] = useState<string>(".*");
  const [inferenceServiceId, setInferenceServiceId] = useState<string>(".*");
  const [sourceLanguage, setSourceLanguage] = useState<string>(".*");
  const [taskType, setTaskType] = useState<string>(".*");
  
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  
  const { data: userslist } = useQuery(["users"], () => listallusers());
  const { data: serviceslist } = useQuery(["services"], () => listServices());

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
    keyslistrefresh2();
    if (selectedUser === ".*") {
      setAPIKeyName(".*");
    }
  }, [setInferenceServiceId]);

  return (
    <>
      <Head>
        <title>Monitoring Dashboard</title>
      </Head>
      <Box ml="1rem" mr="1rem">
        <Box>
          <br></br>
          <br></br>
          <Stack direction={["column", "row"]} spacing="1rem">
            <HStack>
              <FormLabel>User:</FormLabel>
              <Select
                background={"white"}
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
                borderRadius={0}
                value={inferenceServiceId}
                minWidth="15rem"
                onChange={(e) => {
                  setInferenceServiceId(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {serviceslist?.map((s: any) => {
                  return <option value={s._id}>{s.name}</option>;
                })}
              </Select>
            </HStack>
            <HStack>
              <FormLabel>API&nbsp;Key:</FormLabel>
              <Select
                background={"white"}
                borderRadius={0}
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
              <FormLabel>Language:</FormLabel>
              <Select
                background={"white"}
                value={sourceLanguage}
                borderRadius={0}
                minWidth="15rem"
                onChange={(e) => {
                  setSourceLanguage(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {/* {serviceslist?.map((s: any) => {
                    return <option value={s._id}>{s.name}</option>;
                  })} */}
              </Select>
            </HStack>
            <HStack>
              <FormLabel>Task:</FormLabel>
              <Select
                background={"white"}
                value={taskType}
                minWidth="15rem"
                onChange={(e) => {
                  setTaskType(e.target.value);
                }}
              >
                <option value=".*">Overall</option>
                {/* {serviceslist?.map((s: any) => {
                    return <option value={s._id}>{s.name}</option>;
                  })} */}
              </Select>
            </HStack>
          </Stack>
        </Box>
        <br></br>
        <br></br>
        <iframe
          src={`https://grafana.dhruva.co/d/Zj4zOgA7y/dhruva-service-specific-dashboard?orgId=2/d/Zj4zOgA7y/dhruva-service-specific-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${selectedUser}&var-inferenceServiceId=${inferenceServiceId}&var-taskType=${taskType}&var-language=${sourceLanguage}&from=now-1h&to=now&kiosk=tv`}
          width={"95%"}
          height={600}
        //   width={"400%"}
        //   height={400}

        />
        <br></br>
        <br></br>
      </Box>
    </>
  );
};

export default monitoring;
