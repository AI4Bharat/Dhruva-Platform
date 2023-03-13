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
        {props.name}
      </Text>
      <hr></hr>
      <Box mt="1rem" fontSize={"md"}>
        <HStack>
          <Text fontWeight={"bold"}>Type :</Text>
          <Text>{props.type}</Text>
        </HStack>
      </Box>
      <Box fontSize={"md"}>
        <HStack>
          <Text fontWeight={"bold"}>Status:</Text>
          <Text fontWeight={"bold"} color={props?"green.600":"red.600"}>{props.active?"active":"inactive"}</Text>
        </HStack>
      </Box>
      <Box fontSize={"md"}>
        <HStack>
          <Text fontWeight={"bold"}>Total Usage:</Text>
          <Text>0</Text>
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
        name={props.name}
        k={props.k}
        active={props.active}
      />
      <br></br>
      <br></br>
    </Box>
  );
};

export default KeyCard;
