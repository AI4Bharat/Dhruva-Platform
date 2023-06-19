import {
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Benchmark {
  language: string;
  output_length: number;
  generated: number;
  actual: number;
  throughput: number;
  "50%": number;
  "99%": number;
}

export default function ServiceBenchmark({ ...props }) {
  const renderThroughputTag = (type) => {
    switch (type) {
      case "translation":
        return "TKS";
      case "asr":
        return "RTFX";
      case "transliteration":
        return "TKS";
      case "tts":
        return "TKS";
    }
  };

  const [benchmarks, setBenchmarks] = useState([]);

  useEffect(() => {
    if (props.benchmarks !== null) {
      setBenchmarks(props.benchmarks);
    }
  }, [props.benchmarks]);

  return (
    <Grid>
      {Object.entries(benchmarks).map(([key, value]) => {
        return (
          <Card key={key}>
            <CardHeader fontWeight={"bold"}>GPU Count: {key}</CardHeader>
            <CardBody>
              {(value as Benchmark[]).map((benchmark) => {
                return (
                  <Accordion
                    outline={"none"}
                    key={benchmark["language"]}
                    allowToggle
                  >
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left">
                            <Text>{benchmark["language"]}</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel>
                        <SimpleGrid
                          p="1rem"
                          w="100%"
                          h="auto"
                          bg="orange.100"
                          borderRadius={15}
                          columns={2}
                          spacingX="40px"
                          spacingY="20px"
                        >
                          <Stat>
                            <StatLabel>Output Length</StatLabel>
                            <StatNumber>
                              {benchmark["output_length"]}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Generated</StatLabel>
                            <StatNumber>{benchmark["generated"]}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Actual</StatLabel>
                            <StatNumber>{benchmark["actual"]}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>50% Latency</StatLabel>
                            <StatNumber>{benchmark["50%"]}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>99% Latency</StatLabel>
                            <StatNumber>{benchmark["99%"]}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Throughput</StatLabel>
                            <StatNumber>{benchmark["throughput"]}</StatNumber>
                            <StatHelpText>
                              {renderThroughputTag(props.modelType)}
                            </StatHelpText>
                          </Stat>
                        </SimpleGrid>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </CardBody>
          </Card>
        );
      })}
    </Grid>
  );
}
