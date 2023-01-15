import { Box, Grid, Slide, GridItem } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "../Navigation/Sidebar";
import useMediaQuery from "../../hooks/useMediaQuery";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [isblur, setblur] = useState<Boolean>(false);
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  return (
    <Box>
      <Grid templateColumns={"repeat(24,1fr)"}>
        <GridItem colSpan={1}>
          <Box
            onMouseEnter={() => setblur(true)}
            onMouseLeave={() => setblur(false)}
          >
            {smallscreen ? <></> : <Sidebar />}
          </Box>
        </GridItem>
        <GridItem
          colSpan={23}
          mr={smallscreen ? "1%" : "3%"}
          ml={smallscreen ? "1%" : "3%"}
          mt="2%"
        >
          <Box style={isblur ? { opacity: 0.3 } : { opacity: 1 }}>
            {/* <Navbar /> */}
            {children}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};
