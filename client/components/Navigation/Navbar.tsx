import { Box, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const [title, setTitle] = useState<String>("Dashboard");
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
      case "analyze":
        setTitle("Analyze");
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
      width="120%"
      height={"6.5rem"}
      background="white"
      marginLeft={"-2rem"}
    >
      <Text fontWeight={"bold"} fontSize="3xl" ml="2rem" pt="2rem">
        {title}
      </Text>
    </Box>
  );
};

export default Navbar;
