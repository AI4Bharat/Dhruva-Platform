import { Box, Button, HStack, Input, InputGroup, InputLeftElement, Spacer, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import {MdVpnKey} from "react-icons/md";
import useMediaQuery from "../../hooks/useMediaQuery";
import KeyCard from "../Mobile/Admin/KeyCard";

const AccessKeys = () => {

    const dummykeydata : Key[] = [
        {
            id : '1',
            alias : 'Gokul-Key',
            usedBy : 'Gokul',
            createdOn : '5 January 2023'
        },
        {
            id : '2',
            alias : 'Yash-Key',
            usedBy : 'Yash',
            createdOn : '7 January 2023'
        },
        {
            id : '3',
            alias : 'Rugved-Key',
            usedBy : 'Rugved',
            createdOn : '7 January 2023'
        },
        {
            id : '4',
            alias : 'Umashankar-Key',
            usedBy : 'Umashankar',
            createdOn : '9 January 2023'
        },
        {
            id : '5',
            alias : 'Ashwin-Key',
            usedBy : 'Ashwin',
            createdOn : '10 January 2023'
        },
        {
            id : '6',
            alias : 'Nikhil-Key',
            usedBy : 'Nikhil',
            createdOn : '10 January 2023'
        },
      ]

  interface Key 
  {
    id: string;
    alias: string;
    createdOn: string;
    usedBy: string;
  }

  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [hide, togglehide] = useState<boolean>(false);
  const [searchedKeys, setSearchedKeys] = useState<Key[]>(dummykeydata);

  const searchToggler = (event:any) =>
  {
    setSearchedKeys(
        dummykeydata.filter((k) =>
          k.alias.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
  }
  
  return (
    <>
    <Box ml={smallscreen?"1rem":"2rem"} mr={smallscreen?"1rem":"2rem"} mt={smallscreen?"-2rem":"1rem"}>
    <HStack mt="3rem"> <Text fontSize={"3xl"} fontWeight={"bold"}>API&nbsp;Keys</Text><Text fontSize={"3xl"} fontWeight={"bold"}><MdVpnKey/></Text></HStack>
    <InputGroup   mt="1rem" width={smallscreen ? "90vw" : "30rem"} background={"light.100"}>
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
    <Box mt="1rem">
        {
            searchedKeys.length!==0?
            smallscreen?
            <Box>
                {Object.entries(searchedKeys).map(([id, keysData]) => {
                    return (
                    <KeyCard alias={keysData.alias} usedBy={keysData.usedBy} createdOn={keysData.createdOn}/>
                    );
                  })}
            </Box>:
            <Box bg="light.100">
            <Table variant="unstyled">
                <Thead>
                  <Tr>
                    <Th>Key Alias</Th>
                    <Th>Used by</Th>
                    <Th>Created On</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(searchedKeys).map(([id, keysData]) => {
                    return (
                      <Tr key={id} fontSize={"sm"}>
                        <Td>{keysData.alias}</Td>
                        <Td>{keysData.usedBy}</Td>
                        <Td>{keysData.createdOn}</Td>
                        <Td>
                            <Button size={"sm"} variant={"outline"}>
                              View
                            </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
            </Table>
            </Box>:
            <HStack background={"gray.50"} width={smallscreen?"100vw":"auto"}>
            <Spacer />
            <Box textAlign={"center"} display={hide ? "none" : "block"}>
              <Image
                height={smallscreen?300:400}
                width={smallscreen?300:400}
                alt="No Results Found"
                src="NoResults.svg"
              />
              <Text fontSize={"lg"} color="gray.400">
                Uh Oh! No Keys Found
              </Text>
            </Box>
            <Spacer />
          </HStack>
        }
    </Box>
    </Box>
    </>
  );
};

export default AccessKeys;
