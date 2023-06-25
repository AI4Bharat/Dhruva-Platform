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
  NumberInput,
  NumberInputField,
  Box,
} from "@chakra-ui/react";
import { FaRegFileAudio } from "react-icons/fa";
import { useState, useEffect } from "react";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { dhruvaAPI, apiInstance } from "../../api/apiConfig";
import { lang2label } from "../../config/config";
import { getWordCount } from "../../utils/utils";
import React from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
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

const TTSTry: React.FC<Props> = (props) => {
  const [languages, setLanguages] = useState<string[]>([]);
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [language, setLanguage] = useState("hi");
  const [voice, setVoice] = useState("male");
  const [tltText, setTltText] = useState("");
  const [audio, setAudio] = useState("");
  const [audioFormat, setAudioFormat] = useState("wav");
  const [samplingRate, setSamplingRate] = useState(22050);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [requestWordCount, setRequestWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const toast = useToast()
  const [pipelineInput, setPipelineInput] = useState<
    PipelineInput | undefined
  >();
  const [pipelineOuput, setPipelineOutput] = useState<
    PipelineOutput | undefined
  >();
  const getTTSAudio = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaAPI.ttsInference + `?serviceId=${props.serviceId}`,
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
            serviceId: props.serviceId,
            gender: voice,
            samplingRate: samplingRate,
            audioFormat: audioFormat,
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
        setPipelineInput({
          pipelineTasks: [
            {
              config: {
                language: {
                  sourceLanguage: language,
                },
                gender: voice,
                samplingRate: samplingRate,
                audioFormat: audioFormat,
              },
              taskType: ULCATaskType.TTS,
            },
          ],
          inputData: {
            input: [
              {
                source: source,
              },
            ],
          },
        });
        setPipelineOutput({
          pipelineResponse: [
            {
              taskType: ULCATaskType.TTS,
              audio: response.data["audio"],
            },
          ],
        });
        var audioContent = response.data["audio"][0]["audioContent"];
        var audio = "data:audio/wav;base64," + audioContent;
        var audioObject = new Audio(audio);
        audioObject.addEventListener("loadedmetadata", () => {
          setAudioDuration(audioObject.duration);
        });
        setAudio(audio);
        setFetching(false);
        setFetched(true);
        setRequestWordCount(getWordCount(tltText));

        setRequestTime(response.headers["request-duration"]);
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
        placeholder="Type your text here to generate audio..."
        lang={language}
        onChange={undefined}
        onBlur={undefined}
        onKeyDown={undefined}
        enabled={language !== "en"}
      />
    );
  };

  return (
    <>
      <Grid templateRows="repeat(3)" gap={5}>
        <GridItem>
          <Stack direction={["column", "row"]}>
            <Stack direction={"row"} width={smallscreen ? "100%" : "50%"}>
              <Text className="dview-service-try-option-title">
                Select Language:
              </Text>
              <Select
                minW="5rem"
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
            <Stack direction={"row"} width={smallscreen ? "100%" : "50%"}>
              <Text className="dview-service-try-option-title">Voice:</Text>
              <Select
                minW="5rem"
                onChange={(e) => {
                  setVoice(e.target.value);
                }}
              >
                <option value={"male"}>Male</option>
                <option value={"female"}>Female</option>
              </Select>
            </Stack>
          </Stack>
          <Stack direction={["column", "row"]} mt="0.5rem">
            <Stack direction={"row"} width={smallscreen ? "100%" : "50%"}>
              <Text className="dview-service-try-option-title">
                Audio Format:
              </Text>
              <Select
                minW="5rem"
                onChange={(e) => {
                  setAudioFormat(e.target.value);
                }}
              >
                <option selected value={"wav"}>
                  wav
                </option>
                <option value={"mp3"}>mp3</option>
                <option value={"flac"}>flac</option>
                <option value={"flv"}>flv</option>
                <option value={"pcm"}>pcm</option>
                <option value={"ogg"}>ogg</option>
              </Select>
            </Stack>
            <Stack direction={"row"} width={smallscreen ? "100%" : "50%"}>
              <Text className="dview-service-try-option-title">
                Sampling Rate:
              </Text>
              <NumberInput
                defaultValue={22050}
                minW="5rem"
                onChange={(samplingRate) =>
                  setSamplingRate(parseInt(samplingRate))
                }
                value={samplingRate}
              >
                <NumberInputField />
              </NumberInput>
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
                <StatLabel>Response Time</StatLabel>
                <StatNumber>{Number(requestTime) / 1000}</StatNumber>
                <StatHelpText>seconds</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>TTS Audio Duration</StatLabel>
                <StatNumber>{audioDuration}</StatNumber>
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
            <Stack direction={"column"} gap={5}>
              <Button
                onClick={() => {
                  if(tltText.length <= 512)
                  {
                    getTTSAudio(tltText);
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
                <FaRegFileAudio />
              </Button>
              <audio style={{ width: "auto" }} src={audio} controls />

              {fetched && (
                <FeedbackModal
                  pipelineInput={pipelineInput}
                  pipelineOutput={pipelineOuput}
                  taskType={ULCATaskType.TTS}
                />
              )}
            </Stack>
          </Stack>
        </GridItem>
      </Grid>
    </>
  );
};

export default TTSTry;
