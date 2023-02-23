import { Box, Button, HStack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import KeyModal from "../../Admin/KeyModal";
const KeyCard = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box
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
        {props.alias}
      </Text>
      <hr></hr>
      <Box mt="1rem" fontSize={"md"}>
        <HStack>
          <Text fontWeight={"bold"}>Used By :</Text>
          <Text>{props.usedBy}</Text>
        </HStack>
      </Box>
      <Box fontSize={"md"}>
        <HStack>
          <Text fontWeight={"bold"}>Created On:</Text>
          <Text>{props.createdOn}</Text>
        </HStack>
      </Box>
      <Button
        onClick={() => setIsOpen(true)}
        float="right"
        size={"sm"}
        variant={"outline"}
      >
        View
      </Button>
      <KeyModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        alias={props.alias}
        k={props.k}
        validity={props.validity}
      />
      <br></br>
      <br></br>
    </Box>
  );
};

export default KeyCard;
