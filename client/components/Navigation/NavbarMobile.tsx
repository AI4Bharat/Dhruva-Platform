import { Box, HStack, Slide, Text, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "./Sidebar";
import SidebarMobile from "./SidebarMobile";

const NavbarMobile = () => {
  const [title, setTitle] = useState<String>("Dashboard");
  const { isOpen, onToggle } = useDisclosure()
  const router = useRouter();

  useEffect(() => {
    let url = router.pathname.split("/");
    switch (url[1]) {
      case "services":
        if (url[2] && url[2].split("?")[0] == "view") setTitle("View Service");
        else setTitle("Services");
        break;
      case "billing":
        setTitle("Billing");
        break;
      case "models":
        setTitle("Model Registry");
        break;
      case "admin":
        setTitle("Admin Dashboard");
        break;
      case "profile":
        setTitle("Profile");
        break;
      default:
        setTitle("Dashboard");
        break;
    }
  }, [router.pathname]);
  return (
    <Box
      paddingLeft={5}
      marginBottom="1rem"
      width="100vw"
      height={"5rem"}
      background="white"
    >
      <Box  ml="1rem" pt="1.5rem">
        <HStack>
            <Box mr="1rem" fontSize={"2xl"} onClick={onToggle}>
                <GiHamburgerMenu />
            </Box>
            <Slide direction='left' in={isOpen} style={{ zIndex: 10 }} onClick={onToggle}>
                < SidebarMobile />
            </Slide>
            <Text fontWeight={"bold"} fontSize="2xl">
                {title}
            </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default NavbarMobile;
