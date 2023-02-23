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

} from "@chakra-ui/react";

import { useState, useEffect } from "react";

export default function ServiceBenchmark({ ...props }) {
    return (<Grid>
        {props.benchmarks.forEach(benchmark => {
            <Text>{benchmark["payload"]}</Text>
        })}
    </Grid>)
}