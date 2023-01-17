import React from "react";
import { ChakraProvider, Grid, GridItem, Box } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { customTheme } from "../themes/index";
import Sidebar from "../components/Navigation/Sidebar";
import { useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import "../styles/global.css";

interface ContentLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<ContentLayoutProps> = ({ children }) => {
  const [isblur, setblur] = useState<Boolean>(false);
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return (
    <Grid templateAreas={`"nav main"`} gridTemplateColumns={"124px 1fr"}>
      {smallscreen ? (
        <></>
      ) : (
        <GridItem>
          <Box
            onMouseEnter={() => setblur(true)}
            onMouseLeave={() => setblur(false)}
          >
            <Sidebar />
          </Box>
        </GridItem>
      )}

        <GridItem style={isblur ? { opacity: 0.3 } : { opacity: 1 }}>
          {children}
        </GridItem>

    </Grid>
  );
};

export default function App({ Component, pageProps, ...appProps }: AppProps) {
  const isLayoutNeeded = [
    "/home",
    "/services",
    "/services/view",
    "/models",
    "/billing",
    "/profile",
  ].includes(appProps.router.pathname);

  const LayoutComponent = isLayoutNeeded ? Layout : React.Fragment;

  return (
    <ChakraProvider theme={customTheme}>
      <LayoutComponent>
        <Component {...pageProps} />
      </LayoutComponent>
    </ChakraProvider>
  );
}
