import { Box, HStack, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import Image from "next/image";
import useMediaQuery from "../../hooks/useMediaQuery";

const NotFound = (props) => {
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return smallscreen ? (
    <HStack background={"gray.50"} width="100vw" height="50vh">
      <Spacer />
      <Box textAlign={"center"} display={props.hide ? "none" : "block"}>
        <Image
          height={300}
          width={300}
          alt="No Results Found"
          src="NoResults.svg"
        />
        <Text fontSize={"lg"} color="gray.400">
          Uh Oh! No Results Found
        </Text>
      </Box>
      <Spacer />
    </HStack>
  ) : (
    <HStack background={"gray.50"}>
      <Spacer />
      <Box textAlign={"center"} display={props.hide ? "none" : "block"}>
        <Image
          height={400}
          width={400}
          alt="No Results Found"
          src="NoResults.svg"
        />
        <Text fontSize={"lg"} color="gray.400">
          Uh Oh! No Results Found
        </Text>
      </Box>
      <Spacer />
    </HStack>
  );
};

export default NotFound;
