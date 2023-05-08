import React from "react";
import Error from "../public/404.svg";
import Image from "next/image";
import { Box, Button, Flex,  VStack } from "@chakra-ui/react";
import Head from "next/head";
import { AiOutlineLeft } from "react-icons/ai";
import router from "next/router";
function ErrorPage() {
  return (
    <>
    <Head>
      <title>Oops!</title>
    </Head>
    <Box minH={"100vh"}>
      <Flex justify="center" align="center" h="90vh">
        <VStack>
          <Image alt="404 Error" src={Error} />
          {/* <Button onClick={()=>router.push(localStorage.getItem("current_page"))}><AiOutlineLeft/> &nbsp;Go Back</Button> */}
        </VStack>
      </Flex>
    </Box>
    </>
  );
}

export default ErrorPage;
