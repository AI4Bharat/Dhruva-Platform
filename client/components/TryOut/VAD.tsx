import React, { useState } from "react";
import {
  Button,
  Input,
  Stack,
  Text,
  Progress,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
  Box,
} from "@chakra-ui/react";
import { apiInstance } from "../../api/apiConfig";

const SileroVADComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [vadResult, setVadResult] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [requestTime, setRequestTime] = useState<string | null>(null);
  const toast = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleFileUpload = () => {
    if (!file) {
      toast({
        title: "File required",
        description: "Please upload an audio file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFetching(true);
    const formData = new FormData();
    formData.append("file", file);

    apiInstance
      .post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const output = response.data["output"][0]["timestamps"];
        setVadResult(JSON.stringify(output, null, 2));
        setFetching(false);
        setFetched(true);
        setRequestTime(response.headers["request-duration"]);
      })
      .catch(() => {
        setFetching(false);
        toast({
          title: "Error",
          description: "Failed to get VAD result. Please check the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const clearInput = () => {
    setFile(null);
    setVadResult(null);
  };

  return (
    <Grid templateRows="repeat(3)" gap={5}>
      <GridItem>
        <Stack direction="column">
          <Text className="dview-service-try-option-title">
            Upload Audio File:
          </Text>
          <Input type="file" accept="audio/*" onChange={handleFileChange} />
        </Stack>
      </GridItem>
      <GridItem>
        {fetching ? <Progress size="xs" isIndeterminate /> : <></>}
      </GridItem>
      {fetched ? (
        <GridItem>
          <SimpleGrid
            p="1rem"
            w="100%"
            h="auto"
            bg="orange.100"
            borderRadius={15}
            columns={1}
            spacingX="40px"
            spacingY="20px"
          >
            <Stat>
              <StatLabel>Response Time</StatLabel>
              <StatNumber>{Number(requestTime) / 1000}</StatNumber>
              <StatHelpText>seconds</StatHelpText>
            </Stat>
            <Box w="100%" h="auto" bg="white" p={4} borderRadius={10}>
              <Text as="pre">{vadResult}</Text>
            </Box>
          </SimpleGrid>
        </GridItem>
      ) : (
        <></>
      )}
      <GridItem>
        <Stack>
          <Button onClick={handleFileUpload}>Upload & Get VAD Result</Button>
          <Button variant="outline" colorScheme="red" onClick={clearInput}>
            Clear
          </Button>
        </Stack>
      </GridItem>
    </Grid>
  );
};

export default SileroVADComponent;
