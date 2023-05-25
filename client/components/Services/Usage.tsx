import { Box, Text, Table, Td, Th, Tr, Center, Thead } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { listallkeys } from "../../api/serviceAPI";
import useMediaQuery from "../../hooks/useMediaQuery";

const Usage = ({
  type,
  serviceID,
}: {
  type: string;
  serviceID: string;
}) => {
  const { data: keylist } = useQuery(["keys", serviceID], () =>
    listallkeys(serviceID)
  );
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return (
    <>
      <Center background={"orange.50"}>
        {" "}
        <Text fontWeight={"bold"} fontSize={"xl"}>
          Total Usage : {keylist?.total_usage} {type=="asr"?"seconds":"characters"}
        </Text>{" "}
      </Center>
      <Box maxH="500px" overflowY="auto">
        <Table variant={"unstyled"}>
          <Thead position="sticky" top="0" zIndex="sticky" bg="white">
            <Tr>
              <Th>API Key</Th>
              <Th> Usage ({type=="asr"?"seconds":(smallscreen?"chars":"characters")}) </Th>
            </Tr>
          </Thead>
          {keylist?.api_keys?.map((key) => {
            return (
              <Tr key={key.name}>
                <Td>{key.name}</Td>
                <Td>{key.usage}</Td>
              </Tr>
            );
          })}
        </Table>
      </Box>
    </>
  );
};

export default Usage;
