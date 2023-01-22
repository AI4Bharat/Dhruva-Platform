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
import { useState } from "react";
// import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { IndicTransliterate } from "../indic-transliterate/dist/index.modern";
import { dhruvaConfig, lang2label, apiInstance } from "../../config/config";
import { getWordCount } from "../../utils/utils";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function NMTTry({ ...props }) {
  const [language, setLanguage] = useState(
    JSON.stringify({
      sourceLanguage: "en",
      targetLanguage: "hi",
    })
  );
  const [tltText, setTltText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [requestWordCount, setRequestWordCount] = useState(0);
  const [responseWordCount, setResponseWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");

  const getTranslation = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaConfig.translationInference,
        {
          serviceId: props.serviceId,
          input: [
            {
              source: source,
            },
          ],
          config: {
            language: JSON.parse(language),
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
        var output = response.data["output"][0]["target"];
        setTranslatedText(output);
        setFetching(false);
        setFetched(true);
        setRequestWordCount(getWordCount(tltText));
        setResponseWordCount(getWordCount(output));
        setRequestTime(response.headers["request-duration"]);
      });
  };

  const clearIO = () => {
    setTltText("");
    setTranslatedText("");
  };

  const renderTransliterateComponent = () => {
    const currentLanguage: LanguageConfig = JSON.parse(language);
    return (
      <IndicTransliterate
        renderComponent={(props) => (
          <Textarea resize="none" h={200} {...props} />
        )}
        onChangeText={(text) => {
          setTltText(text);
        }}
        value={tltText}
        placeholder="Type your text here to transliterate...."
        lang={currentLanguage.sourceLanguage}
      />
    );
  };

  return (
    <Grid templateRows="repeat(3)" gap={5}>
      <GridItem>
        <Stack direction={"row"}>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">Languages:</Text>

            <Select
              onChange={(e) => {
                clearIO();
                setLanguage(e.target.value);
              }}
            >
              {props.languages.map((languageConfig: LanguageConfig) => {
                return (
                  <option
                    key={JSON.stringify(languageConfig)}
                    value={JSON.stringify(languageConfig)}
                  >
                    {lang2label[languageConfig.sourceLanguage]} -{" "}
                    {lang2label[languageConfig.targetLanguage]}
                  </option>
                );
              })}
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
              <StatLabel>Word Count</StatLabel>
              <StatNumber>{requestWordCount}</StatNumber>
              <StatHelpText>Request</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Word Count</StatLabel>
              <StatNumber>{responseWordCount}</StatNumber>
              <StatHelpText>Response</StatHelpText>
            </Stat>
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
        <Stack>
          {renderTransliterateComponent()}
          <Textarea
            readOnly
            value={translatedText}
            w={"auto"}
            resize="none"
            h={200}
            placeholder="View Translation Here..."
          />
          <Button
            onClick={() => {
              getTranslation(tltText);
            }}
          >
            Translate
          </Button>
        </Stack>
      </GridItem>
    </Grid>
  );
}
