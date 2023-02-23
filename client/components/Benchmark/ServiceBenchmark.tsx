import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Progress,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  CardHeader,
  CardFooter,
  CardBody,
  Card,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

export default function ServiceBenchmark({ ...props }) {
  return (
    <Grid>
      {props.benchmarks.map((benchmark, idx) => {
        return (
          <Accordion key={idx} allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <Heading fontSize={"3xl"}>{benchmark["name"]}</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {benchmark["payloads"].map((payload, idx) => {
                  return (
                    <Card
                      key={idx}
                      p={3}
                      mt={5}
                      w="auto"
                      borderRadius={15}
                      bg={"orange.100"}
                    >
                      <CardHeader>
                        <Heading size="md">{payload["payload"]}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stack direction={"row"}>
                          <Stat
                            p={3}
                            w="fit-content"
                            borderRadius={15}
                            bg="white"
                          >
                            <StatLabel>Latency</StatLabel>
                            <StatNumber>{payload["latency"]}</StatNumber>
                          </Stat>
                          <Stat
                            p={3}
                            w="fit-content"
                            borderRadius={15}
                            bg="white"
                          >
                            <StatLabel>Generated</StatLabel>
                            <StatNumber>{payload["generated"]}</StatNumber>
                          </Stat>
                          <Stat
                            p={3}
                            w="fit-content"
                            borderRadius={15}
                            bg="white"
                          >
                            <StatLabel>Actual</StatLabel>
                            <StatNumber>{payload["actual"]}</StatNumber>
                          </Stat>
                          <Stat
                            p={3}
                            w="fit-content"
                            borderRadius={15}
                            bg="white"
                          >
                            <StatLabel>{payload["metricName"]}</StatLabel>
                            <StatNumber>{payload["metricValue"]}</StatNumber>
                          </Stat>
                        </Stack>
                      </CardBody>
                    </Card>
                  );
                })}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        );
      })}
    </Grid>
  );
}
