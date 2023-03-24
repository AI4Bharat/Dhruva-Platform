import {
  Box,
  Button,
  Center,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spacer,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdVpnKey } from "react-icons/md";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import useMediaQuery from "../../hooks/useMediaQuery";
import KeyCard from "../Mobile/Admin/KeyCard";
import KeyModal from "./KeyModal";
import {
  createkey,
  listallkeys,
  listallusers,
  viewadmindashboard,
} from "../../api/adminAPI";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FaCopy } from "react-icons/fa";

const AccessKeys = () => 
{
  interface Key {
    id: string;
    name: string;
    services: any;
    type: string;
    active: boolean;
    masked_key: string;
  }

  interface ModalData {
    name: string;
    active: boolean;
    masked_key: string;
  }

  interface Icreatekey {
    name: string;
    type: string;
    regenerate: boolean;
    target_user_id: string;
  }

  const { data: userslist } = useQuery(["users"], () => listallusers());
  const [selectedUser, setSelectedUser] = useState<string>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [createKeyDetails, setCreateKeyDetails] = useState<Icreatekey>({
    name: "",
    type: "INFERENCE",
    regenerate: true,
    target_user_id: selectedUser,
  });

  const { data: allkeys, refetch: allkeysrefetch } = useQuery(
    ["pages", selectedUser],
    () => listallkeys(selectedUser)
  );

  const { data, refetch, isError } = useQuery(
    ["keys", selectedUser, limit, page],
    () => viewadmindashboard(selectedUser, limit, page)
  );

  const totalpages = Math.ceil(allkeys?.length / limit);

  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [hide, togglehide] = useState<boolean>(true);
  const [modalstate, setModalState] = useState<ModalData>({
    name: "",
    masked_key: "",
    active: false,
  });
  const [searchedKeys, setSearchedKeys] = useState<Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modal, setModal] = useState(<></>);
  const [buttonDisplayText, setButtonDisplayText] = useState<string>("Create");
  const mutation = useMutation(createkey);

  useEffect(() => {
    setPage(1);
    setLimit(10);
    refetch();
    allkeysrefetch();
    setSearchedKeys([]);
  }, [selectedUser]);

  useEffect(() => {
    refetch();
    allkeysrefetch();
    togglehide(true);
    setSearchedKeys([]);
  }, [limit, page, data]);

  useEffect(() => {
    if (data) {
      togglehide(false);
      setSearchedKeys(data);
    }
  }, [data]);

  const searchToggler = (event: any) => {
    if (data) {
      setSearchedKeys(
        data.filter((k) =>
          k.name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    }
  };

  const updateName = (newName: string) => {
    setCreateKeyDetails((prevState) => ({
      ...prevState,
      name: newName,
    }));
  };

  const updateType = (newType: string) => {
    setCreateKeyDetails((prevState) => ({
      ...prevState,
      type: newType,
    }));
  };

  const updateRegenerate = (newRegenerate: boolean) => {
    setCreateKeyDetails((prevState) => ({
      ...prevState,
      regenerate: newRegenerate,
    }));
  };

  const handlecreate = () => {
    if (buttonDisplayText == "Create") {
      const regex =
        /[ `!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~ABCDEFGHIJKLMNOPQRSTUVWXYZ]/; // regular expression that matches special characters and uppercase letters
      if (!regex.test(createKeyDetails.name)) {
        mutation.mutate(createKeyDetails, {
          onSuccess: (data) => {
            refetch();
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
            setButtonDisplayText("Close");
          },
          onError: (data) => {
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
                  {"ERROR"}
                </Text>
              </Box>
            );
          },
        });
      } else {
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
              {createKeyDetails.name == ""
                ? "Name Cannot Be Empty"
                : "Invalid Name"}
            </Text>
          </Box>
        );
      }
      refetch();
      allkeysrefetch();
    } else {
      onClose();
    }
  };

  const renew = () => {
    setModal(<></>);
    setButtonDisplayText("Create");
    setCreateKeyDetails({
      name: "",
      type: "INFERENCE",
      regenerate: true,
      target_user_id: selectedUser,
    });
  };


  const buttons = [];

  for (let i = 1; i <= totalpages; i++) 
  {
    buttons.push(
      <Button key={i} onClick={() => setPage(i)}>
       {i}
      </Button>
    );
  }

  return (
    <>
      <Box
        ml={smallscreen ? "1rem" : "2rem"}
        mr={smallscreen ? "1rem" : "2rem"}
        mt={smallscreen ? "-2rem" : "1rem"}
      >
        {/* Page Heading */}
        <HStack mt="3rem">
          {" "}
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            API&nbsp;Keys
          </Text>
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            <MdVpnKey />
          </Text>
        </HStack>
        {/* Searchbar and Create Button */}
        <Stack
          direction={["column", "column", "column", "column", "row"]}
          mt="1rem"
          mr={smallscreen ? "0rem" : "2rem"}
        >
          <InputGroup
            background={"light.100"}
            width={smallscreen ? "90vw" : "30rem"}
          >
            <InputLeftElement
              color="gray.300"
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input
              disabled={!selectedUser}
              borderRadius={0}
              onChange={searchToggler}
              placeholder="Search for Keys"
            />
          </InputGroup>
          <Select
            color={"gray.300"}
            background={"light.100"}
            width={smallscreen ? "90vw" : "30rem"}
            borderRadius={0}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              renew();
            }}
          >
            <option defaultValue={null} selected disabled hidden>
              Select a User
            </option>
            {userslist?.map((user: any) => {
              return <option value={user._id}>{user.name}</option>;
            })}
          </Select>
          <Spacer />
          {selectedUser ? (
            <Button
              onClick={() => {
                onOpen();
                renew();
              }}
              width={smallscreen ? "90vw" : "10rem"}
            >
              Create a New Key
            </Button>
          ) : (
            <></>
          )}

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create a New Key</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormLabel mt="1rem">Name</FormLabel>
                <Input
                  value={createKeyDetails.name}
                  borderRadius={0}
                  onChange={(e) => updateName(e.target.value)}
                />
                <FormLabel mt="1rem">Type</FormLabel>
                <Select
                  borderRadius={0}
                  value={createKeyDetails.type}
                  onChange={(e) => updateType(e.target.value)}
                >
                  <option>INFERENCE</option>
                  <option>PLATFORM</option>
                </Select>
                <FormLabel mt="1rem">Regenerate</FormLabel>
                <Select
                  borderRadius={0}
                  value={createKeyDetails.regenerate ? "True" : "False"}
                  onChange={(e) =>
                    updateRegenerate(e.target.value == "True" ? true : false)
                  }
                >
                  <option>True</option>
                  <option>False</option>
                </Select>
                <FormLabel mt="1rem">User ID</FormLabel>
                <Box
                  width={"100%"}
                  minH={"3rem"}
                  border={"1px"}
                  borderColor={"gray.300"}
                  background={"blackAlpha.50"}
                >
                  <Text ml="1rem" mr="1rem" mt="0.5rem" color={"gray.600"}>
                    {selectedUser}
                  </Text>
                </Box>
                {modal}
              </ModalBody>
              <ModalFooter>
                <Button
                  mt="2rem"
                  mr={3}
                  onClick={() => {
                    handlecreate();
                  }}
                >
                  {buttonDisplayText}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Stack>
        {/* Table */}
        {selectedUser ? (
          <>
            <Box mt="1rem" mb="2rem">
              {searchedKeys.length !== 0 ? 
              (
                smallscreen ? 
                (
                  <Box>
                    {Object.entries(searchedKeys).map(([id, keysData]) => {
                      return (
                        <KeyCard
                          refreshCard={refetch}
                          name={keysData.name}
                          type={keysData.type}
                          active={keysData.active}
                          k={keysData.masked_key}
                        />
                      );
                    })}
                  </Box>
                ) : 
                (
                  <Box bg="light.100" height={67*limit}>
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
                              <Td
                                fontWeight={"bold"}
                                color={
                                  keysData.active ? "green.600" : "red.600"
                                }
                              >
                                {keysData.active ? "active" : "inactive"}
                              </Td>
                              <Td>0</Td>
                              <Td>
                                <Button
                                  onClick={() => {
                                    setModalOpen(true),
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
                      onRefresh={(data) => {
                        refetch();
                        setModalState({
                          name: data.name,
                          masked_key: data.masked_key,
                          active: data.active,
                        });
                      }}
                      isOpen={modalOpen}
                      onClose={() => {
                        setModalOpen(false);
                      }}
                      name={modalstate.name}
                      k={modalstate.masked_key}
                      active={modalstate.active}
                    />
                  </Box>
                )
              ) : 
              (
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
                      {"Uh Oh! No Keys Found"}
                    </Text>
                  </Box>
                  <Spacer />
                </HStack>
              )}
            </Box>
            {/* Pagination */}
            {
              (totalpages > 0 && searchedKeys?.length > 0)?
            <Box marginLeft={smallscreen?"45vw":"0rem"}>
              <Center >
                <VStack>
                <HStack color={"gray.400"}>
                  <Button  color={page == 1 ? "gray.400" : "gray.600"} variant={"link"} onClick={()=>{if(page!==1){setPage(page-1)}}} >
                  <AiOutlineLeft
                    fontSize={"x-large"}
                  />
                  </Button>
                  <Spacer /><Spacer /><Spacer /> <Spacer /> <Spacer /> <Spacer />
                  <Text fontSize={"large"}>
                    {page}/{totalpages}
                  </Text>
                  <Spacer /><Spacer /> <Spacer /> <Spacer /> <Spacer /> <Spacer />
                  <Button color={page == totalpages ? "gray.400" : "gray.600"} variant={"link"} onClick={()=>{if(page!==totalpages){setPage(page+1)}}} >
                  <AiOutlineRight fontSize={"x-large"} />
                  </Button>
                </HStack>
                <br></br>
                <br></br>
                <HStack>
                {buttons}
                </HStack>
                </VStack>
              </Center>
              <br />
            </Box>:<></>
            }
          </>
        ) : (
          <HStack background={"gray.50"} width={smallscreen ? "100vw" : "auto"}>
            <Spacer />
            <Box textAlign={"center"} display={"block"}>
              <Image
                height={smallscreen ? 300 : 400}
                width={smallscreen ? 300 : 400}
                alt="No Results Found"
                src="NoResults.svg"
              />
              <Text fontSize={"lg"} color="gray.400">
                {"Select a User to Display Keys"}
              </Text>
            </Box>
            <Spacer />
          </HStack>
        )}
      </Box>
    </>
  );
};

export default AccessKeys;
