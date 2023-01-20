import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const ServiceCard = (props: any) => {
  return (
    <Box
      ml="1rem"
      mr="1rem"
      mb="1rem"
      pl="1rem"
      pr="1rem"
      pt="1rem"
      border="1px"
      borderColor={"gray.200"}
      background="white"
      minH={"10vh"}
      minW={"90vw"}
      maxW={"90vw"}
    >
      <Text fontSize={"xl"} fontWeight={"extrabold"}>
        {props.name}
      </Text>
      <hr></hr>
      <Box mt="1rem" fontSize={"md"}>
        <Text fontWeight={"bold"}>Model ID :</Text>
        <Text>{props.modelID}</Text>
      </Box>
      <Box fontSize={"md"}>
        <HStack>
        <Text fontWeight={"bold"}>Version  :</Text>
        <Text>{props.version}</Text>
        </HStack>
      </Box>
      <Box fontSize={"md"}>
        <HStack>
            <Text fontWeight={"bold"}>Task Type :</Text>
            <Text>{props.taskType}</Text>
        </HStack>
      </Box>
      <Link
        href={{
          pathname: `/models`,
          query: {
            serviceId: props.serviceID,
          },
        }}
      >
        <Button float="right" size={"sm"} variant={"outline"}>
          View
        </Button>
      </Link>
      <br></br>
      <br></br>
    </Box>
  );
};

export default ServiceCard;
