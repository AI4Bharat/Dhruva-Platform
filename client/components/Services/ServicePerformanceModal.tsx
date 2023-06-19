import {
  Box,
  Button,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tab,
  TabList,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { SlGraph } from "react-icons/sl";
import { listallusers } from "../../api/adminAPI";
import { getService, listalluserkeys } from "../../api/serviceAPI";

const ServicePerformanceModal = ({ ...props }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const service_id = props.service_id;

  const [selectedUser, setSelectedUser] = useState<string>(".*");
  const [apiKeyName, setAPIKeyName] = useState<string>(".*");
  const [isUserOverall, setIsUserOverall] = useState(false);

  const { data: userslist } = useQuery(["users"], () => listallusers());
  const { data: keylist, refetch: refreshKeysList } = useQuery(
    ["keys"],
    () => listalluserkeys(service_id, selectedUser),
    { enabled: isUserOverall }
  );

  useEffect(() => {
    if (selectedUser === ".*") {
      setIsUserOverall(false);
    } else {
      setIsUserOverall(true);
      refreshKeysList();
    }
  }, [selectedUser]);

  return (
    <>
      <Button onClick={onOpen}>
        <SlGraph />
      </Button>
      <Modal isOpen={isOpen} size="8xl" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading>Dashboard</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction={["column", "row"]} spacing={"1rem"}>
              <HStack>
                <FormLabel>User:</FormLabel>
                <Select
                  value={selectedUser}
                  minWidth="15rem"
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                  }}
                >
                  <option value=".*">Overall</option>
                  {userslist?.map((user: any) => {
                    return (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    );
                  })}
                </Select>
              </HStack>
              <HStack>
                <FormLabel>API&nbsp;Key:</FormLabel>
                <Select
                  value={apiKeyName}
                  minWidth="15rem"
                  onChange={(e) => {
                    setAPIKeyName(e.target.value);
                  }}
                  isDisabled={selectedUser === ".*"}
                >
                  {selectedUser !== ".*" ? (
                    keylist &&
                    keylist["api_keys"]?.map((k: any) => {
                      return (
                        <option key={k.name} value={k.name}>
                          {k.name}
                        </option>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </Select>
              </HStack>
            </Stack>
            <br />
            <iframe
              src={`${process.env.NEXT_PUBLIC_GRAFANA_URL}/d/Ye6zPeA7y/dhruva-inference-request-dashboard?orgId=2&var-apiKeyName=${apiKeyName}&var-userId=${selectedUser}&var-inferenceServiceId=${service_id}&from=now-1h&to=now&kiosk=tv`}
              width={"100%"}
              height={600}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServicePerformanceModal;
