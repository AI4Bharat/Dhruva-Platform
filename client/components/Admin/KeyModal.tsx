import React from 'react'

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Box } from "@chakra-ui/react";

const KeyModal = ({isOpen, onClose, alias, k, validity}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg='blackAlpha.300'/>
      <ModalContent>
        <ModalHeader>{alias}</ModalHeader>
        <ModalBody>
          <p>{k}</p>
          <p>{validity}</p>
        </ModalBody>
        <ModalFooter>
          <Button  mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default KeyModal