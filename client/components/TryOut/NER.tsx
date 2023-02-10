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
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IndicTransliterate } from "../indic-transliterate/dist/index.modern";
import {
  dhruvaConfig,
  lang2label,
  apiInstance,
  tag2Color,
} from "../../config/config";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function NERTry({ ...props }) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState("hi");
  const [fetching, setFetching] = useState(false);
  const [tltText, setTltText] = useState("");
  const [fetched, setFetched] = useState(false);
  const [requestTime, setRequestTime] = useState("");
  const [nerTokens, setNERTokens] = useState([]);

  const getNEROutput = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaConfig.nerInference + `?serviceId=${props.serviceId}`,
        {
          input: [
            {
              source: source,
            },
          ],
          config: {
            language: {
              sourceLanguage: language,
            },
          },
        },
        {
          headers: {
            accept: "application/json",
            authorization: process.env.NEXT_PUBLIC_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const tokens = response.data["output"][0]["nerPrediction"];
        setRequestTime(response.headers["request-duration"]);
        setNERTokens(tokens);
        setFetching(false);
        setFetched(true);
      });
  };

  useEffect(() => {
    const uniqueSourceLanguages: any = Array.from(
      new Set(
        props.languages.map(
          (language: LanguageConfig) => language.sourceLanguage
        )
      )
    );
    setLanguages(uniqueSourceLanguages);
    setLanguage(uniqueSourceLanguages[0]);
  }, []);

  const renderTransliterateComponent = () => {
    return (
      <IndicTransliterate
        renderComponent={(props) => (
          <Textarea resize="none" h={200} {...props} />
        )}
        onChangeText={(text: string) => {
          setTltText(text);
        }}
        value={tltText}
        placeholder="Type your text here for NER Inference..."
        lang={language}
        onChange={undefined}
        onBlur={undefined}
        onKeyDown={undefined}
        enabled={language !== "en"}
      />
    );
  };

  return (
    <Grid templateRows="repeat(3)" gap={5}>
      <GridItem>
        <Stack direction={"column"}>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">
              Select Language:
            </Text>
            <Select
              onChange={(e) => {
                setLanguage(e.target.value);
              }}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {lang2label[language]}
                </option>
              ))}
            </Select>
          </Stack>
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
            columns={2}
            spacingX="40px"
            spacingY="20px"
          >
            <Stat>
              <StatLabel>Response Time</StatLabel>
              <StatNumber>{Number(requestTime) / 1000}</StatNumber>
              <StatHelpText>seconds</StatHelpText>
            </Stat>
          </SimpleGrid>
        </GridItem>
      ) : (
        <></>
      )}
      <GridItem>
        <Stack spacing={5}>
          {renderTransliterateComponent()}
          <Box
            p="1rem"
            borderRadius={15}
            bg={"gray.100"}
            resize="none"
            minH={200}
          >
            {Object.entries(nerTokens).map(([idx, element]) => {
              return (
                <span
                  key={idx}
                  style={{
                    padding: 3,
                    backgroundColor: tag2Color[element["tag"]][0],
                    borderRadius: 15,
                    lineHeight: 1.8,
                    marginRight: 3,
                  }}
                >
                  {element["token"]}{" "}
                  <span
                    style={{
                      padding: 3,
                      backgroundColor: tag2Color[element["tag"]][1],
                      borderRadius: 15,
                      color: "white",
                    }}
                  >
                    {element["tag"]}
                  </span>
                </span>
              );
            })}
          </Box>
          <Stack direction={"column"} gap={5}>
            <Button
              onClick={() => {
                getNEROutput(tltText);
              }}
            >
              Generate
            </Button>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  );
}
