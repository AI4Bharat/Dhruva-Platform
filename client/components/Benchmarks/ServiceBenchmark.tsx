import {
  Stack,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  CardHeader,
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

export default function ServiceBenchmark({ ...props }) {
  const renderPayload = (payload: string, task: string) => {
    switch (task) {
      case "asr":
        return (
          <audio controls>
            <source src={payload} />
          </audio>
        );
      default:
        return <Heading size="md">{payload}</Heading>;
    }
  };

  return (
    <Grid>
      {props.benchmarks.map((benchmark, idx) => {
        return (
          <Accordion outline={"none"} key={idx} allowToggle>
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
                {benchmark["gpuSettings"].map((object, idx) => {
                  return (
                    <Card key={idx}>
                      <CardHeader>
                        <Heading fontSize={"xl"}>
                          GPU Count : {object["count"]}
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        {object["payloads"].map((payload, idx) => {
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
                                {renderPayload(payload["payload"], props.task)}
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
                                    <StatNumber>
                                      {payload["latency"]}
                                    </StatNumber>
                                  </Stat>
                                  <Stat
                                    p={3}
                                    w="fit-content"
                                    borderRadius={15}
                                    bg="white"
                                  >
                                    <StatLabel>Generated</StatLabel>
                                    <StatNumber>
                                      {payload["generated"]}
                                    </StatNumber>
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
                                    <StatLabel>
                                      {payload["metricName"]}
                                    </StatLabel>
                                    <StatNumber>
                                      {payload["metricValue"]}
                                    </StatNumber>
                                  </Stat>
                                </Stack>
                              </CardBody>
                            </Card>
                          );
                        })}
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
