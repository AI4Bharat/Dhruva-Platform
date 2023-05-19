import { Box, HStack, Menu, MenuButton, MenuItem, MenuList, Select, Spacer, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BiUser } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../api/authAPI";


const Navbar = () => {
  const [title, setTitle] = useState<String>("Dashboard");
  const router = useRouter();
  const {data:user} = useQuery(['User'], ()=>getUser(localStorage.getItem('email')))
  const Logout = () =>
  {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("email");
    router.push("/");
  }
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
      case "pipeline":
        setTitle("Pipeline");
        break;
      default:
        setTitle("Dashboard");
        break;
    }
  }, [router.pathname]);
  return (
    <Box
      paddingLeft={10}
      width="120%"
      height={"6.5rem"}
      background="white"
      marginLeft={"-2rem"}
    >
      <HStack>
        <Text fontWeight={"bold"} fontSize="3xl" ml="2rem" pt="2rem">
          {title}
        </Text>
        <Spacer/>
        <Box pt="2rem" pr="25rem">
        <Menu>
        <MenuButton
          px={4}
          py={2}
          transition='all 0.2s'
        >
          <HStack>
          <BiUser/>
          <Text>{user?.name}</Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={()=>router.push('/profile')} value="profile">My Profile</MenuItem>
          <MenuItem onClick={Logout} value="logout">Logout</MenuItem>
        </MenuList>
      </Menu>
      </Box>
      </HStack>
    </Box>
  );
};

export default Navbar;
