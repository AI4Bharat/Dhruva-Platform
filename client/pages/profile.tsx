import { Box, Button, Center, Checkbox, Divider, FormLabel, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Stack, StackDivider, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head"
import Image from "next/image"
import { useState } from "react";
import { BiPencil } from "react-icons/bi";
import { HiUserCircle } from "react-icons/hi";
import { getUser, updateUser } from "../api/authAPI";
import useMediaQuery from "../hooks/useMediaQuery";

export default function Profile() {
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const {data:user} = useQuery(['User'], ()=>getUser(localStorage.getItem('email')))
  const toast = useToast();
  const [ipName, setIpName]= useState<string>(user?.name);
  const [ipPassword, setIpPassword]= useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const mutation = useMutation(updateUser);

  const updateProfile = () => 
  {
    mutation.mutate({name:ipName, password:ipPassword},
      {
      onSuccess : data =>{
        toast({
          title: "Success",
          description: "Credentials Updated Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError : e =>{
        toast({
          title: "Error",
          description: "Something went wrong. Please try again after some time",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      })
  }

  return (
  <>
    <Head>
        <title>My Profile</title>
    </Head>
    <Box
        ml={smallscreen ? "1rem" : "2rem"}
        mr={smallscreen ? "1rem" : "2rem"}
        mt={smallscreen ? "-2rem" : "1rem"}
      >
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
          <Button onClick={()=>{onOpen();setShowPassword(false)}} width="20rem" mt="2rem" variant={"outline"}>
              Edit Profile 
              &nbsp;
              <BiPencil/>
          </Button>
          </Box>
          </Center>
        </Stack>
        </Center>
      </Box>


      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <HStack width="20rem" mt="1rem">
          <Text mr="2rem" fontSize={"large"}>Name&nbsp;: </Text>
          <Input onChange={(e)=>{setIpName(e.target.value)}} variant={"filled"} value={ipName}></Input>
          </HStack>
          <StackDivider/>
          <HStack mb="1rem" width="20rem" mt="1rem">
          <Text  fontSize={"large"}>Password&nbsp;: </Text>
          <Input  onChange={(e)=>{setIpPassword(e.target.value)}} type={showPassword?"text":"password"} value={ipPassword} variant={"filled"}></Input>
          </HStack>
          <Checkbox onChange={()=>setShowPassword(!showPassword)}>Show Password?</Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='outline' onClick={updateProfile}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </Box>
  </>
  )
}
