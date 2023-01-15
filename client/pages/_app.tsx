import React from "react";
import { ChakraProvider, Grid, GridItem } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { customTheme } from "../themes/index";
import "../styles/global.css";

interface ContentLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<ContentLayoutProps> = ({ children }) => {
  return (
    <Grid templateAreas={`"nav main"`} gridTemplateColumns={"112px 1fr"}>
      <GridItem>{/* NavBar goes here..... */}</GridItem>
      <GridItem>{children}</GridItem>
    </Grid>
  );
};

export default function App({ Component, pageProps, ...appProps }: AppProps) {
  const isLayoutNeeded = [
    "/home",
    "/services",
    "/services/view",
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
