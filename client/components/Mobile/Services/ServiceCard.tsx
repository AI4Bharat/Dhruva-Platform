import { Box, Button, Text } from "@chakra-ui/react";
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
        <Text fontWeight={"bold"}>Service ID :</Text>
        <Text>{props.serviceID}</Text>
      </Box>
      <Box fontSize={"md"}>
        <Text fontWeight={"bold"}>Model ID :</Text>
        <Text>{props.modelID}</Text>
      </Box>
      <Box fontSize={"md"}>
        <Text fontWeight={"bold"}>Published on :</Text>
        <Text>{props.date}</Text>
      </Box>
      <Link
        href={{
          pathname: `/services/view`,
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
