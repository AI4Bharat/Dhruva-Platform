import React from "react";
import Error from "../public/403.svg";
import Image from "next/image";
import { Box, Flex,  VStack } from "@chakra-ui/react";
import Head from "next/head";
function ErrorPage() {
  return (
    <>
    <Head>
      <title>Oops!</title>
    </Head>
    <Box minH={"100vh"}>
      <Flex justify="center" align="center" h="90vh">
        <VStack>
          <Image alt="403 Error" src={Error} />
        </VStack>
      </Flex>
    </Box>
    </>
  );
}

export default ErrorPage;
