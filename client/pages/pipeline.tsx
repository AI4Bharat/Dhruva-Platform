import {
  Box,
  Heading,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Grid,
  GridItem,
  Select,
} from "@chakra-ui/react";
import ContentLayout from "../components/Layouts/ContentLayout";
import Head from "next/head";
import useMediaQuery from "../hooks/useMediaQuery";

export default function Pipeline() {
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return (
    <>
      <Head>Pipelines</Head>
      <ContentLayout>
        {smallscreen ? (
          <Grid
            ml="1rem"
            mr="1rem"
            mb="1rem"
            minW={"90vw"}
            maxW={"90vw"}
            gap={10}
          ></Grid>
        ) : (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={5}
            className="service-view"
            bg="light.100"
          ></Grid>
        )}
      </ContentLayout>
    </>
  );
}
