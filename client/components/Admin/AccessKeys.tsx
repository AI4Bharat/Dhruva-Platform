import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdVpnKey } from "react-icons/md";
import useMediaQuery from "../../hooks/useMediaQuery";
import KeyCard from "../Mobile/Admin/KeyCard";
import KeyModal from "./KeyModal";
import { listallkeys } from "../../api/adminAPI";
import { useQuery } from "@tanstack/react-query";

const AccessKeys = () => {
  interface Key {
    id: string;
    name: string;
    services : any;
    type: string;
    active: boolean;
    masked_key: string;
  }

  interface ModalData {
    name: string;
    active: boolean;
    masked_key: string;
  }

  // const dummykeydata: Key[] = [
  //   {
  //     id: "1",
  //     name: "Gokul-Key",
  //     type: "ADMIN",
  //     active : false,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  //   {
  //     id: "2",
  //     name: "Yash-Key",
  //     type: "ADMIN",
  //     active : true,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  //   {
  //     id: "3",
  //     name: "Rugved-Key",
  //     type: "ADMIN",
  //     active : true,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  //   {
  //     id: "4",
  //     name: "Umashankar-Key",
  //     type: "ADMIN",
  //     active : true,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  //   {
  //     id: "5",
  //     name: "Ashwin-Key",
  //     type: "ADMIN",
  //     active : true,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  //   {
  //     id: "6",
  //     name: "Nikhil-Key",
  //     type: "ADMIN",
  //     active : true,
  //     services : [],
  //     masked_key: "YAES0997869685AWGHIUH9876875A67456AWFGUYWAG897TAW877",
  //   },
  // ];

  const { data } = useQuery(["services", "640821bea4b229f2b8545108"], () => listallkeys("640821bea4b229f2b8545108"));
  
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [hide, togglehide] = useState<boolean>(true);
  const [modalstate, setModalState] = useState<ModalData>({name:"", masked_key:"", active : false,});
  const [searchedKeys, setSearchedKeys] = useState<Key[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if(data)
    {
        setSearchedKeys(data);
        togglehide(false);
    }

}, [data]);

  const searchToggler = (event: any) => {
    setSearchedKeys(
      data.filter((k) =>
        k.name.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  return (
    <>
      <Box
        ml={smallscreen ? "1rem" : "2rem"}
        mr={smallscreen ? "1rem" : "2rem"}
        mt={smallscreen ? "-2rem" : "1rem"}
      >
        <HStack mt="3rem">
          {" "}
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            API&nbsp;Keys
          </Text>
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            <MdVpnKey />
          </Text>
        </HStack>
        <InputGroup
          mt="1rem"
          width={smallscreen ? "90vw" : "30rem"}
          background={"light.100"}
        >
          <InputLeftElement
            color="gray.600"
            pointerEvents="none"
            children={<IoSearchOutline />}
          />
          <Input
            borderRadius={0}
            onChange={searchToggler}
            placeholder="Search for Keys"
          />
        </InputGroup>
        <Box mt="1rem" mb="2rem">
          {searchedKeys.length !== 0 ? (
            smallscreen ? (
              <Box>
                {Object.entries(searchedKeys).map(([id, keysData]) => {
                  return (
                    <KeyCard
                      name={keysData.name}
                      type={keysData.type}
                      active={keysData.active}
                      k={keysData.masked_key}
                    />
                  );
                })}
              </Box>
            ) : (
              <Box bg="light.100">
                <Table variant="unstyled">
                  <Thead>
                    <Tr>
                      <Th>Key Name</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Total Usage</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(searchedKeys).map(([id, keysData]) => {
                      return (
                        <Tr key={id} fontSize={"sm"}>
                          <Td>{keysData.name}</Td>
                          <Td>{keysData.type}</Td>
                          <Td fontWeight={"bold"} color={keysData.active?"green.600":"red.600"}>{keysData.active?"active":"inactive"}</Td>
                          <Td>0</Td>
                          <Td>
                            <Button
                              onClick={() => {
                                setIsOpen(true),
                                  setModalState({
                                    name: keysData.name,
                                    masked_key: keysData.masked_key,
                                    active: keysData.active,
                                  });
                              }}
                              size={"sm"}
                              variant={"outline"}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                <KeyModal
                  isOpen={isOpen}
                  onClose={() => {
                    setIsOpen(false);
                  }}
                  name={modalstate.name}
                  k={modalstate.masked_key}
                  active={modalstate.active}
                />
              </Box>
            )
          ) : (
            <HStack
              background={"gray.50"}
              width={smallscreen ? "100vw" : "auto"}
            >
              <Spacer />
              <Box textAlign={"center"} display={hide ? "none" : "block"}>
                <Image
                  height={smallscreen ? 300 : 400}
                  width={smallscreen ? 300 : 400}
                  alt="No Results Found"
                  src="NoResults.svg"
                />
                <Text fontSize={"lg"} color="gray.400">
                  Uh Oh! No Keys Found
                </Text>
              </Box>
              <Spacer />
            </HStack>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AccessKeys;
