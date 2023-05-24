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
import { useEffect, useState } from "react";
import { dhruvaAPI, apiInstance } from "../../api/apiConfig";
import { lang2label } from "../../config/config";
import { getWordCount } from "../../utils/utils";
import React from "react";
import {
  PipelineInput,
  PipelineOutput,
  ULCATaskType,
} from "../Feedback/FeedbackTypes";
import { FeedbackModal } from "../Feedback/Feedback";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Props {
  languages: LanguageConfig[];
  serviceId: string;
}

const XLITTry: React.FC<Props> = (props) => {
  const [language, setLanguage] = useState(
    JSON.stringify({
      sourceLanguage: "en",
      targetLanguage: "hi",
    })
  );
  const [tltText, setTltText] = useState("");
  const [transliteratedText, settransliteratedText] = useState("");
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

  const getTransliteration = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaAPI.xlitInference + `?serviceId=${props.serviceId}`,
        {
          input: [
            {
              source: tltText,
            },
          ],
          config: {
            serviceId: props.serviceId,
            language: {
              sourceLanguage: JSON.parse(language)["sourceLanguage"],
              sourceScriptCode: "",
              targetLanguage: JSON.parse(language)["targetLanguage"],
              targetScriptCode: "",
            },
            isSentence: true,
            numSuggestions: 5,
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
        console.log(response);
        var output = response.data["output"][0]["target"][0];
        setPipelineInput({
          pipelineTasks: [
            {
              config: {
                serviceId: props.serviceId,
                language: {
                  sourceLanguage: JSON.parse(language)["sourceLanguage"],
                  sourceScriptCode: "",
                  targetLanguage: JSON.parse(language)["targetLanguage"],
                  targetScriptCode: "",
                },
                isSentence: true,
                numSuggestions: 5,
              },
              taskType: ULCATaskType.TRANSLITERATION,
            },
          ],
          inputData: {
            input: [{ source: source }],
          },
        });
        setPipelineOutput({
          pipelineResponse: [
            {
              taskType: ULCATaskType.TRANSLITERATION,
              output: response.data["output"],
            },
          ],
        });
        settransliteratedText(output);
        setFetching(false);
        setFetched(true);
        setRequestWordCount(getWordCount(tltText));
        setResponseWordCount(getWordCount(output));
        setRequestTime(response.headers["request-duration"]);
      });
  };

  const clearIO = () => {
    setTltText("");
    settransliteratedText("");
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
          <Textarea
            value={tltText}
            onChange={(e) => {
              setTltText(e.target.value);
            }}
            w={"auto"}
            resize="none"
            h={200}
            placeholder="Type in Source Language Here..."
          />
          <Textarea
            readOnly
            value={transliteratedText}
            w={"auto"}
            resize="none"
            h={200}
            placeholder="View Transliteration Here..."
          />
          <Button
            onClick={() => {
              getTransliteration(tltText);
            }}
          >
            Transliterate
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

export default XLITTry;
