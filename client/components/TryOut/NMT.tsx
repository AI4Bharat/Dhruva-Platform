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
  useToast,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { dhruvaAPI, apiInstance } from "../../api/apiConfig";
import { lang2label } from "../../config/config";
import { getWordCount } from "../../utils/utils";
import React from "react";
import { FeedbackModal } from "../Feedback/Feedback";
import {
  PipelineInput,
  PipelineOutput,
  ULCATaskType,
} from "../Feedback/FeedbackTypes";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Props {
  languages: LanguageConfig[];
  serviceId: string;
}

const NMTTry: React.FC<Props> = (props) => {
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
  const [pipelineInput, setPipelineInput] = useState<
    PipelineInput | undefined
  >();
  const [pipelineOutput, setPipelineOutput] = useState<
    PipelineOutput | undefined
  >();
  const toast = useToast()

  const getTranslation = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaAPI.translationInference + `?serviceId=${props.serviceId}`,
        {
          input: [
            {
              source: source,
            },
          ],
          config: {
            language: JSON.parse(language),
          },
          controlConfig: {
            dataTracking: true,
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
        setPipelineInput({
          pipelineTasks: [
            {
              config: {
                language: JSON.parse(language),
                serviceId: props.serviceId,
              },
              taskType: ULCATaskType.TRANSLATION,
            },
          ],
          inputData: {
            input: [{ source: source }],
          },
        });
        setPipelineOutput({
          pipelineResponse: [
            {
              taskType: ULCATaskType.TRANSLATION,
              output: response.data["output"],
            },
          ],
        });
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
          <>
          <Textarea  resize="none" h={200} {...props} />
          <Box>
            <Text float={"right"} fontSize={"sm"} color={(tltText.length<=512 ?"gray.300":"red.300")}>{tltText.length}/512</Text>
          </Box>
          </>
        )}
        onChangeText={(text: string) => {
          setTltText(text);
        }}
        value={tltText}
        placeholder="Type your text here to translate...."
        lang={currentLanguage.sourceLanguage}
        onChange={undefined}
        onBlur={undefined}
        onKeyDown={undefined}
        enabled={currentLanguage.sourceLanguage !== "en"}
      />
    );
  };

  useEffect(() => {
    const initialLanguageConfig = props.languages[0];
    setLanguage(JSON.stringify(initialLanguageConfig));
  }, []);

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
                    {lang2label[languageConfig.sourceLanguage]} -{"> "}
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
              if(tltText.length <= 512)
              {
                getTranslation(tltText);
              }
              else
              {
                toast({
                  title: 'Character limit exceeded',
                  status: 'warning',
                  duration: 3000,
                  isClosable: true,
                })
              }
            }}
          >
            Translate
          </Button>
          {fetched && (
            <FeedbackModal
              pipelineInput={pipelineInput}
              pipelineOutput={pipelineOutput}
              taskType={ULCATaskType.TRANSLATION}
            />
          )}
        </Stack>
      </GridItem>
    </Grid>
  );
};

export default NMTTry;
