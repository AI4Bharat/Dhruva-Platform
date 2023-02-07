import React from "react";
import { ChakraProvider, Grid, GridItem, Box } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { customTheme } from "../themes/index";
import Sidebar from "../components/Navigation/Sidebar";
import { useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import "../styles/global.css";
import "../components/indic-transliterate/dist/index.css";
import Navbar from "../components/Navigation/Navbar";
import NavbarMobile from "../components/Navigation/NavbarMobile";
import Script from "next/script";

interface ContentLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<ContentLayoutProps> = ({ children }) => {
  const [isblur, setblur] = useState<Boolean>(false);
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return (
    <>
      <Grid
        overflowX={"hidden"}
        templateAreas={`"nav main"`}
        gridTemplateColumns={"95px 1fr"}
      >
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
          {smallscreen ? <NavbarMobile /> : <Navbar />}
          {children}
        </GridItem>
      </Grid>
    </>
  );
};

export default function App({ Component, pageProps, ...appProps }: AppProps) {
  const isLayoutNeeded = [
    "/home",
    "/services",
    "/services/view",
    "/models",
    "/models/view",
    "/billing",
    "/profile",
    "/analyze",
  ].includes(appProps.router.pathname);

  const LayoutComponent = isLayoutNeeded ? Layout : React.Fragment;

  return (
    <ChakraProvider theme={customTheme}>
      <LayoutComponent>
        <Script
          type="text/javascript"
          src="https://ai4bharat.github.io/Recorderjs/lib/recorder.js"
        />
        <Component {...pageProps} />
      </LayoutComponent>
    </ChakraProvider>
  );
}
