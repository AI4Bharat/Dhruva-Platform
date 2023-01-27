import { Box, HStack, Spacer, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
  const bg = useColorModeValue("light.100", "dark.100");
  const fg = useColorModeValue("light.200", "dark.200");
  return (
    <Box pt="1%" px="1%">
      <Box mt="1%" py="2%" px="2%" h="90%">
        {children}
      </Box>
    </Box>
  );
};

export default ContentLayout;
