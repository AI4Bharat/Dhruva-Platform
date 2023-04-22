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
            </AccordionItem>
          </Accordion>
        );
      })}
    </Grid>
  );
}
