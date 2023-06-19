import {
  Text,
  Box,
  SimpleGrid,
  Button,
  Divider,
  useColorModeValue,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import Image from "next/image";
import { IoConstructOutline, IoGridOutline } from "react-icons/io5";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { RiFlowChart } from "react-icons/ri";
import { BiChart } from "react-icons/bi";

const SidebarMobile: React.FC = () => {
  const bg = useColorModeValue("light.100", "dark.100");
  const [isOpen, setNavbar] = useState<Boolean>(false);
  const [number, setNumber] = useState<Number>(0);
  const [userRole, setUserRole] = useState<String>("CONSUMER");
  const router = useRouter();
  useEffect(() => {
    setUserRole(localStorage.getItem("user_role"));
    switch (router.pathname.split("/")[1]) {
      case "services":
        setNumber(1);
        break;
      case "admin":
        setNumber(2);
        break;
      case "monitoring":
        setNumber(4);
        break;
      case "models":
        setNumber(3);
        break;
      case "pipeline":
        setNumber(5);
        break;
      default:
        setNumber(0);
        break;
    }
  }, [router.pathname]);

  return (
    <Box
      h="100vh"
      position="fixed"
      background={bg}
      p="4"
      zIndex={50}
      style={{ textAlign: "center" }}
      width={"200px"}
      transition="width 0.2s"
      boxShadow={"md"}
    >
      <Box borderRadius="xl">
        <Box h="4rem" justifyContent="flex-start">
          <HStack>
            <Image alt="logo" src="/AI4Bharat.svg" height="50" width="50" />
            <Spacer />
            <Text marginLeft={4} fontSize={"x-large"} fontWeight={"bold"}>
              Dhruva
            </Text>
            <Spacer />
            <Spacer />
          </HStack>
        </Box>
        <Divider />
        <SimpleGrid
          spacingY={4}
          spacingX={1}
          mt="9"
          width={"100%"}
          marginLeft={"0"}
        >
          {/* <Box>
              <Link href={"/home"}>
                <Button
                  mb="2"
                  ml={isOpen ? 0 : 0}
                  h={10}
                  variant={number === 0 ? "solid" : "ghost"}
                  background={number === 0 ? "orange.500" : "transperent"}
                  color={number === 0 ? "white" : "black"}
                  size="l"
                  boxShadow={number === 0 ? "xl" : "none"}
                  w={"100%"}
                  justifyContent="flex-start"
                >
                  <Box>
                    <BiHomeCircle style={{ marginLeft: 12 }} size={25} />
                  </Box>
                    <Text marginLeft={4} fontWeight={"normal"}>
                      Home
                    </Text>
                </Button>
              </Link>
            </Box> */}
          <Box>
            <Link href={"/services"}>
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                w="100%"
                variant={number === 1 ? "solid" : "ghost"}
                background={number === 1 ? "orange.500" : "transperent"}
                color={number === 1 ? "white" : "black"}
                justifyContent="flex-start"
                size="l"
                boxShadow={number === 1 ? "xl" : "none"}
                transition="width 0.2s"
              >
                <Box>
                  <IoGridOutline style={{ marginLeft: 12 }} size={25} />
                </Box>
                <Text marginLeft={4} fontWeight={"normal"}>
                  Services
                </Text>
              </Button>
            </Link>
          </Box>

          <Box w="100%">
            <Link href={"/models"}>
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                w="100%"
                variant={number === 3 ? "solid" : "ghost"}
                background={number === 3 ? "orange.500" : "transperent"}
                color={number === 3 ? "white" : "black"}
                justifyContent="flex-start"
                size="l"
                boxShadow={number === 3 ? "xl" : "none"}
                transition="width 0.2s"
              >
                <Box>
                  <IoConstructOutline style={{ marginLeft: 12 }} size={25} />
                </Box>
                <Text marginLeft={4} fontWeight={"normal"}>
                  Models
                </Text>
              </Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href={"/pipeline"}>
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                w="100%"
                variant={number === 5 ? "solid" : "ghost"}
                background={number === 5 ? "orange.500" : "transperent"}
                color={number === 5 ? "white" : "black"}
                justifyContent="flex-start"
                size="l"
                boxShadow={number === 5 ? "xl" : "none"}
                transition="width 0.2s"
              >
                <Box>
                  <IoConstructOutline style={{ marginLeft: 12 }} size={25} />
                </Box>
                <Text marginLeft={4} fontWeight={"normal"}>
                  Pipeline
                </Text>
              </Button>
            </Link>
          </Box>
          <Box>
            <Link href={"/monitoring"}>
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                variant={number === 4 ? "solid" : "ghost"}
                background={number === 4 ? "orange.500" : "transperent"}
                color={number === 4 ? "white" : "black"}
                size="l"
                boxShadow={number === 4 ? "xl" : "none"}
                w={"100%"}
                justifyContent="flex-start"
              >
                <Box>
                  <BiChart style={{ marginLeft: 12 }} size={25} />
                </Box>
                  <Text marginLeft={4} fontWeight={"normal"}>
                    Monitoring
                  </Text>
              </Button>
            </Link>
          </Box>
          {/* <Box>
            <Link href={"/billing"}>
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                w="100%"
                variant={number === 4 ? "solid" : "ghost"}
                background={number === 4 ? "orange.500" : "transperent"}
                color={number === 4 ? "white" : "black"}
                justifyContent="flex-start"
                size="l"
                boxShadow={number === 4 ? "xl" : "none"}
                transition="width 0.2s"
              >
                <Box>
                  <AiOutlineDollarCircle style={{ marginLeft: 12 }} size={25} />
                </Box>
                <Text marginLeft={4} fontWeight={"normal"}>
                  Billing
                </Text>
              </Button>
            </Link>
          </Box> */}

          <Box>
            <Link href="/admin">
              <Button
                mb="2"
                ml={isOpen ? 0 : 0}
                h={10}
                w="100%"
                variant={number === 2 ? "solid" : "ghost"}
                background={number === 2 ? "orange.500" : "transperent"}
                color={number === 2 ? "white" : "black"}
                justifyContent="flex-start"
                size="l"
                boxShadow={number === 2 ? "xl" : "none"}
                transition="width 0.2s"
              >
                <Box>
                  <MdOutlineAdminPanelSettings
                    style={{ marginLeft: 12, marginRight: 12 }}
                    size={25}
                  />
                </Box>
                <Text fontWeight={"normal"}> Admin</Text>
              </Button>
            </Link>
          </Box>

          {/* 
          <Box position={"absolute"} bottom="10">
            <Box>
              <Link href="/profile">
                <Button
                  mb="2"
                  ml={isOpen ? 0 : 0}
                  h={10}
                  w={"100%"}
                  variant={number === 2 ? "solid" : "ghost"}
                  colorScheme={number === 2 ? "primary" : "transperent"}
                  justifyContent="flex-start"
                  size="l"
                  boxShadow={number === 2 ? "xl" : "none"}
                  transition="width 0.2s"
                >
                  <Box>
                    <Avatar style={{ marginLeft: 12 }} size="sm" />
                  </Box>
                  <Text marginLeft={4} fontWeight={"normal"}>
                    Profile
                  </Text>
                </Button>
              </Link>
            </Box>
          </Box> */}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default SidebarMobile;
