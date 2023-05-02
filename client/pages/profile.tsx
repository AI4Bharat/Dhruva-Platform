import { Box, Button, Center, Divider, FormLabel, HStack, Input, Spacer, Stack, StackDivider, Text, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query";
import Head from "next/head"
import Image from "next/image"
import { BiPencil, BiUser } from "react-icons/bi";
import { HiUserCircle } from "react-icons/hi";
import { getUser } from "../api/authAPI";
import useMediaQuery from "../hooks/useMediaQuery";

export default function Profile() {
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const {data:user} = useQuery(['User'], ()=>getUser(localStorage.getItem('email')))
  return (
  <>
    <Head>
        <title>Admin Dashboard</title>
    </Head>
    <Box
        ml={smallscreen ? "1rem" : "2rem"}
        mr={smallscreen ? "1rem" : "2rem"}
        mt={smallscreen ? "-2rem" : "1rem"}
      >
      {/* <HStack mt="3rem" ml="2rem">
          {" "}
          <Text fontSize={smallscreen?"3xl":"5xl"} fontWeight={"bold"}>
          <HiUserCircle/>
          </Text>
          <Text fontSize={smallscreen?"xl":"3xl"} fontWeight={"bold"}>
            {user?.name}
          </Text>
          <Spacer/>
          <Spacer/>
          <Button>{smallscreen?"Edit":"Edit Profile"}</Button>
      </HStack> */}
      <Box ml={smallscreen?"0rem":"2rem"} mt={smallscreen?"3rem":"1rem"} background={"white"} width="90vw" height={smallscreen?"45vh":"60vh"} pl="1rem" pt="1rem">
      <Center>
        <Stack direction={['column','row']}>
          <Box mr="8rem">
            <VStack>
            {!smallscreen&&<Image alt="icon" src="profile.svg" width={500} height={500}/>}
            <HStack>
            {smallscreen&&<HiUserCircle size={40} />}
            <Text fontSize={smallscreen?"xl":"3xl"} fontWeight={"bold"}>
            {user?.name}
            </Text>
            </HStack>
            </VStack>
          </Box>
          <Divider orientation='vertical' />
          <Center>
          <Box >
          <HStack width="20rem" mt="1rem">
          <Text fontSize={"large"}>Name&nbsp;: </Text>
          <Input variant={"filled"} disabled value={user?.name}></Input>
          </HStack>
          <StackDivider/>
          <HStack width="20rem" mt="1rem">
          <Text fontSize={"large"}>Email&nbsp;: </Text>
          <Input variant={"filled"} disabled value={user?.email}></Input>
          </HStack>
          <StackDivider/>
          <HStack width="20rem" mt="1rem">
          <Text fontSize={"large"}>Role&nbsp;: </Text>
          <Input variant={"filled"} disabled value={user?.role}></Input>
          </HStack>
          <Button width="20rem" mt="2rem" variant={"outline"}>
              Edit Profile 
              &nbsp;
              <BiPencil/>
          </Button>
          </Box>
          </Center>
        </Stack>
        </Center>
      </Box>
    </Box>
  </>
  )
}
