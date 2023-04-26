import React, { useState } from 'react'

import { Modal, Text, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Box, HStack } from "@chakra-ui/react";
import { BiArrowBack } from 'react-icons/bi';
import { setstatus } from '../../api/adminAPI';
import { useMutation } from '@tanstack/react-query';

const KeyModal = ({isOpen, onClose, name, k, active, onRefresh, user_id}) => {

  const mutation = useMutation(setstatus);
  const [modal, setModal] = useState(<></>)

  const regenerateAPIKey = () =>
  {

  }

  const handleRevoke = () =>
  {
    mutation.mutate({name : name as string, action : active ? "REVOKE" : "ACTIVATE", target_user_id: user_id}, {
      onSuccess: (data) => {
        setModal(
          <Box
            mt="1rem"
            width={"100%"}
            minH={"3rem"}
            border={"1px"}
            borderColor={"gray.300"}
            background={active?"red.50":"green.50"}
          >
            <Text ml="1rem" mr="1rem" mt="1rem" color={active?"red.600":"green.600"}>
              Key {active?"Revoked":"Activated"} Successfully
            </Text>
          </Box>
        );
        onRefresh(data);
      },
      onError: (error) => {
        setModal(
          <Box
            mt="1rem"
            width={"100%"}
            minH={"3rem"}
            border={"1px"}
            borderColor={"gray.300"}
            background={"red.50"}
          >
            <Text ml="1rem" mr="1rem" mt="0.5rem" color={"red.600"}>
              ERROR
            </Text>
          </Box>
        );
      },
    });
    
  }

  return (
    <Modal isOpen={isOpen} onClose={()=>{onClose(); setModal(<></>)}}>
      <ModalOverlay bg='blackAlpha.300'/>
      <ModalContent alignItems={"left"}>
      <Button variant={"ghost"} mt="1rem" ml="1rem" width={"10rem"} onClick={()=>{onClose(); setModal(<></>)}}><BiArrowBack/>&nbsp;Back to List</Button >
        <ModalHeader>{name}</ModalHeader>
        <ModalBody>
        <Box width={"100%"} minH={"4rem"} border={"1px"} borderColor={"gray.300"} background={"blackAlpha.50"} >
        <Text ml="1rem" mr="1rem" mt="0.5rem" mb="0.5rem" color={"gray.600"}>{k}</Text>
        </Box>
        <HStack  ml="1rem" mt="0.7rem">
          <Text>Status : </Text>
          <Text fontWeight={"bold"} color={active?"green.600":"red.600"}>{active?"active":"inactive"}</Text>
        </HStack>
        {modal}
        </ModalBody>
        <ModalFooter >
          <HStack mt="2rem"  mr={3} >
          <Button variant={"outline"} onClick={handleRevoke}>
            {active?"Revoke":"Activate"}
          </Button>
          <Button onClick={regenerateAPIKey}>
            Regenerate
          </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default KeyModal