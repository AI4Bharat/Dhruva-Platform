import React, { useState } from 'react'

import { Modal, Text, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Box, HStack } from "@chakra-ui/react";
import { BiArrowBack } from 'react-icons/bi';
import { createkey, getkeydata, setstatus } from '../../api/adminAPI';
import { useMutation } from '@tanstack/react-query';
import { taskOptions } from '../Utils/Options';
import { FaCopy } from 'react-icons/fa';
import { userAgent } from 'next/server';

const KeyModal = ({ isOpen, onClose, name, k, active, onRefresh, user_id, type, data_tracking }: {
  isOpen: boolean;
  onClose: any;
  name: string;
  k: string;
  active: boolean;
  onRefresh: any;
  user_id: string;
  type: string;
  data_tracking: boolean;
})=> {

  const mutation = useMutation(setstatus);
  const [modal, setModal] = useState(<></>)

  const regenerate = useMutation(createkey);
  const getdata = useMutation(getkeydata)

  const regenerateAPIKey = () =>
  {
    regenerate.mutate({name : name , type: type, target_user_id:user_id, regenerate:true, data_tracking:data_tracking }, {
      onSuccess: (data) =>{
        // refetch();
        setModal(
          <>
            <Box
              mt="1rem"
              width={"100%"}
              minH={"3rem"}
              border={"1px"}
              borderColor={"gray.300"}
              background={"green.50"}
            >
              <Text ml="1rem" mr="1rem" mt="1rem" color={"green.600"}>
                Copy the API Key. This won't be visible again.
              </Text>
            </Box>
            <Box
              mt="1rem"
              width={"100%"}
              minH={"4rem"}
              border={"1px"}
              borderColor={"gray.300"}
              background={"blackAlpha.50"}
            >
              <Text
                ml="1rem"
                mr="1rem"
                mt="1rem"
                mb="0.5rem"
                color={"gray.600"}
              >
                {data.api_key}
              </Text>
            </Box>
            <Button
              mt="0.5rem"
              variant="ghost"
              onClick={() => navigator.clipboard.writeText(data.api_key)}
            >
              <FaCopy />
              &nbsp; Copy Key
            </Button>
          </>
        );
        getdata.mutate({api_key_name:name, target_user_id:user_id},{
          onSuccess: data =>{
              onRefresh(data);
          }
      })
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
    })
  }

  const handleRevoke = () =>
  {
    mutation.mutate({name : name as string, active : (active ? false : true), target_user_id: user_id}, {
      onSuccess: (data) => {
        setModal(
          <Box
            mt="1rem"
            width={"100%"}
            minH={"3rem"}
            border={"1px"}
            borderColor={"gray.300"}
            background={"green.50"}
          >
            <Text ml="1rem" mr="1rem" mt="1rem" color={"green.600"}>
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