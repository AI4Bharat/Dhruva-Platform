import React from 'react'

import { Modal, Text, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Box, HStack } from "@chakra-ui/react";
import { BiArrowBack } from 'react-icons/bi';
import { FaCopy } from 'react-icons/fa';

const KeyModal = ({isOpen, onClose, alias, k, validity}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg='blackAlpha.300'/>
      <ModalContent alignItems={"left"}>
      <Button variant={"ghost"} mt="1rem" ml="1rem" width={"10rem"} onClick={onClose}><BiArrowBack/>&nbsp;Back to List</Button >
        <ModalHeader>{alias}</ModalHeader>
        <ModalBody>
        <Box width={"100%"} minH={"4rem"} border={"1px"} borderColor={"gray.300"} background={"blackAlpha.50"} >
        <Text ml="1rem" mr="1rem" mt="0.5rem" mb="0.5rem" color={"gray.600"}>{k}</Text>
        </Box>
        <Button mt="0.5rem" variant="ghost" onClick={()=>navigator.clipboard.writeText(k)}>
        <FaCopy/>&nbsp; Copy Key
        </Button>
          <Text ml="1rem" mt="0.7rem">Validity : {validity}</Text>
        </ModalBody>
        <ModalFooter >
          <Button variant={"outline"} mt="2rem"  mr={3} >
            Revoke
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default KeyModal