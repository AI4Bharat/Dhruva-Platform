import {
  Box,
  Button,
  Center,
  Checkbox,
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

const AccessKeys = () => {
  interface Key {
    id: string;
    name: string;
    services: any;
    type: string;
    active: boolean;
    masked_key: string;
    data_tracking: boolean;
  }

  interface ModalData {
    name: string;
    active: boolean;
    masked_key: string;
    data_tracking: boolean;
    type: string;
  }

  interface Icreatekey {
    name: string;
    type: string;
    data_tracking: boolean;
    target_user_id: string;
    regenerate: boolean;
  }

  const { data: userslist } = useQuery({
    queryKey: ["users"],
    queryFn: listallusers,
  });

  const [selectedUser, setSelectedUser] = useState<string>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [createKeyDetails, setCreateKeyDetails] = useState<Icreatekey>({
    name: "",
    type: "INFERENCE",
    data_tracking: true,
    target_user_id: selectedUser,
    regenerate: false,
  });

  const { data: allkeys, refetch: allkeysrefetch } = useQuery({
    queryKey: ["pages", selectedUser],
    queryFn: () => listallkeys(selectedUser),
  });

  const { data, refetch, isError } = useQuery({
    queryKey: ["keys", selectedUser, limit, page],
    queryFn: () => viewadmindashboard(selectedUser, limit, page),
  });

  const totalPages = Math.ceil(allkeys?.length / limit);

  const smallScreen = useMediaQuery("(max-width: 1080px)");
  const [hide, toggleHide] = useState<boolean>(true);
  const [modalState, setModalState] = useState<ModalData>({
    name: "",
    masked_key: "",
    type: "",
    data_tracking: true,
    active: false,
  });
  const [searchedKeys, setSearchedKeys] = useState<Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState(<></>);
  const [buttonDisplayText, setButtonDisplayText] = useState<string>("Create");
  const mutation = useMutation({
    mutationFn: createkey,
  });

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
    toggleHide(true);
    setSearchedKeys([]);
  }, [limit, page, data]);

  useEffect(() => {
    if (data) {
      toggleHide(false);
      setSearchedKeys(data.api_keys);
    }
  }, [data]);

  const searchToggler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (data) {
      setSearchedKeys(
        data.api_keys.filter((k) =>
          k.name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    }
  };

  const updateCreateKeyDetails = (field: keyof Icreatekey, value: any) => {
    setCreateKeyDetails((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleCreate = () => {
    if (buttonDisplayText === "Create") {
      const regex =
        /[ `!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~ABCDEFGHIJKLMNOPQRSTUVWXYZ]/; // regex for special characters and uppercase letters
      if (!regex.test(createKeyDetails.name)) {
        mutation.mutate(createKeyDetails, {
          onSuccess: (data) => {
            refetch();
            setModalContent(
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
          onError: () => {
            setModalContent(
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
        setModalContent(
          <Box
            mt="1rem"
            width={"100%"}
            minH={"3rem"}
            border={"1px"}
            borderColor={"gray.300"}
            background={"red.50"}
          >
            <Text ml="1rem" mr="1rem" mt="0.5rem" color={"red.600"}>
              {createKeyDetails.name === ""
                ? "Name Cannot Be Empty"
                : "Invalid Name"}
            </Text>
          </Box>
        );
      }
    } else {
      onClose();
    }
  };

  const renew = () => {
    setModalContent(<></>);
    setButtonDisplayText("Create");
    setCreateKeyDetails({
      name: "",
      type: "INFERENCE",
      data_tracking: true,
      target_user_id: selectedUser,
      regenerate: false,
    });
  };

  const pageButtons = Array.from({ length: totalPages }, (_, i) => (
    <Button key={i + 1} onClick={() => setPage(i + 1)}>
      {i + 1}
    </Button>
  ));

  const findPerKeyUsage = (key: Key) => {
    return key.services.length > 0
      ? key.services.reduce((count, service) => count + service.usage, 0)
      : 0;
  };

  return (
    <>
      <Box
        ml={smallScreen ? "1rem" : "2rem"}
        mr={smallScreen ? "1rem" : "2rem"}
        mt={smallScreen ? "-2rem" : "0rem"}
      >
        {/* Page Heading */}
        <HStack mt="3rem">
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            API&nbsp;Keys
          </Text>
        </HStack>
        {/* Searchbar and Create Button */}
        <Stack
          direction={["column", "column", "column", "column", "row"]}
          mt="1rem"
          mr={smallScreen ? "0rem" : "2rem"}
        >
          <InputGroup
            background={"light.100"}
            width={smallScreen ? "90vw" : "30rem"}
          >
            <InputLeftElement
              color={"gray.600"}
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input
              color={"gray.600"}
              disabled={!selectedUser}
              borderRadius={0}
              onChange={searchToggler}
              placeholder="Search for Keys"
              _placeholder={{ opacity: 1, color: "gray.600" }}
            />
          </InputGroup>
          <Select
            color={"gray.600"}
            onChange={(event) => {
              setSelectedUser(event.target.value);
              updateCreateKeyDetails("target_user_id", event.target.value);
            }}
            placeholder="Select User"
            width={smallScreen ? "90vw" : "30rem"}
          >
            {userslist &&
              userslist.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </Select>
          <Button
            colorScheme="green"
            disabled={!selectedUser}
            onClick={onOpen}
            width={smallScreen ? "90vw" : "30rem"}
          >
            Create Key
          </Button>
        </Stack>
        {/* Keys Table */}
        {hide ? (
          <Center>
            <Text mt="1rem" fontSize="lg">
              No Keys Available
            </Text>
          </Center>
        ) : (
          <Table mt="2rem" colorScheme="gray" variant="striped">
            <Thead>
              <Tr>
                <Th>Key Name</Th>
                <Th>Type</Th>
                <Th>Usage</Th>
                <Th>Active</Th>
              </Tr>
            </Thead>
            <Tbody>
              {searchedKeys.length > 0 &&
                searchedKeys.map((key: Key) => (
                  <Tr key={key.id}>
                    <Td>
                      <HStack spacing={2}>
                        <Text fontWeight={"bold"}>{key.name}</Text>
                        <Button
                          variant={"link"}
                          onClick={() => {
                            setModalState({
                              ...modalState,
                              name: key.name,
                              masked_key: key.masked_key,
                              type: key.type,
                              data_tracking: key.data_tracking,
                              active: key.active,
                            });
                            setModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </HStack>
                    </Td>
                    <Td>{key.type}</Td>
                    <Td>{findPerKeyUsage(key)}</Td>
                    <Td>
                      <Checkbox isChecked={key.active} />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        )}
        {/* Pagination Buttons */}
        {totalPages > 0 && (
          <HStack mt="2rem" spacing={2}>
            <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
              <AiOutlineLeft />
            </Button>
            {pageButtons}
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <AiOutlineRight />
            </Button>
          </HStack>
        )}
      </Box>

      {/* Modal for Create Key */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormLabel>API Key Name</FormLabel>
              <Input
                placeholder="Enter Key Name"
                onChange={(e) => updateCreateKeyDetails("name", e.target.value)}
              />
              <Checkbox
                isChecked={createKeyDetails.data_tracking}
                onChange={(e) =>
                  updateCreateKeyDetails("data_tracking", e.target.checked)
                }
              >
                Enable Data Tracking
              </Checkbox>
              <Select
                placeholder="Select Key Type"
                onChange={(e) => updateCreateKeyDetails("type", e.target.value)}
              >
                <option value="INFERENCE">Inference</option>
                <option value="TRAINING">Training</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreate}>
              {buttonDisplayText}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Key Details */}
      {modalOpen && (
        <KeyModal
          name={modalState.name}
          masked_key={modalState.masked_key}
          data_tracking={modalState.data_tracking}
          type={modalState.type}
          active={modalState.active}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default AccessKeys;
