import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Grid,
  GridItem,
  Progress,
  Input,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Box,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { dhruvaAPI, apiInstance } from "../../api/apiConfig";
import { lang2label } from "../../config/config";
import { getWordCount } from "../../utils/utils";
import { CloseIcon } from "@chakra-ui/icons";
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

const STSTry: React.FC<Props> = (props) => {
  const [language, setLanguage] = useState(
    JSON.stringify({
      sourceLanguage: "en",
      targetLanguage: "hi",
    })
  );
  const [placeholder, setPlaceHolder] = useState(
    "Start Recording/Upload for S2S Inference..."
  );
  const [fetching, setFetching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<any>(null);
  const [fetched, setFetched] = useState(false);
  const [requestTime, setRequestTime] = useState("");
  const [voiceGender, setVoiceGender] = useState("male");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [audioContent, setAudioContent] = useState("");
  const [requestWordCount, setRequestWordCount] = useState(0);
  const [responseWordCount, setResponseWordCount] = useState(0);
  const [sourceAudioDuration, setSourceAudioDuration] = useState(0);
  const [targetAudioDuration, setTargetAudioDuration] = useState(0);
  const [modal, setModal] = useState(<></>);
  const [gotOutput, setGotOutput] = useState<boolean>(false);
  const [pipelineInput, setPipelineInput] = useState<
    PipelineInput | undefined
  >();
  const [pipelineOutput, setPipelineOutput] = useState<
    PipelineOutput | undefined
  >();

  const startRecording = () => {
    setRecording(!recording);
    setFetched(false);
    setFetching(true);
    setPlaceHolder("Recording Audio....");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setAudioStream(stream);
        var AudioContext = window.AudioContext;
        var audioContext = new AudioContext();
        var input = audioContext.createMediaStreamSource(stream);
        var Recorder = (window as any).Recorder;
        var newRecorder = new Recorder(input, { numChannels: 1 });
        setRecorder(newRecorder);
        newRecorder.record();
        console.log("Recording started");
      })
      .catch((e) => {
        setModal(
          <Box
            mt="1rem"
            width={"100%"}
            minH={"3rem"}
            border={"1px"}
            borderColor={"gray.300"}
            background={"red.50"}
          >
            <HStack ml="1rem" mr="1rem" mt="0.6rem">
              <Text color={"red.600"}>Required Permissions Denied</Text>
              <Spacer />
              <CloseIcon
                onClick={() => setModal(<></>)}
                color={"red.600"}
                fontSize={"xs"}
              />
            </HStack>
          </Box>
        );
        // console.log((e as Error).message);
      });
  };

  const getASROutput = (asrInput: string) => {
    apiInstance
      .post(
        dhruvaAPI.stsInference + `?serviceId=${props.serviceId}`,
        {
          audio: [
            {
              audioContent: asrInput,
            },
          ],
          config: {
            language: JSON.parse(language),
            audioFormat: "wav",
            gender: voiceGender,
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
              taskType: ULCATaskType.STS,
              config: {
                language: JSON.parse(language),
                audioFormat: "wav",
                gender: voiceGender,
                serviceId: props.serviceId,
              },
            },
          ],
          inputData: {
            audio: [
              {
                audioContent: asrInput,
              },
            ],
          },
        });
        setPipelineOutput({
          pipelineResponse: [
            {
              taskType: ULCATaskType.STS,
              audio: response.data.audio,
            },
          ],
        });
        const data = response.data;
        setSourceText(data["output"][0]["source"]);
        setTargetText(data["output"][0]["target"]);
        setRequestWordCount(getWordCount(data["output"][0]["source"]));
        setResponseWordCount(getWordCount(data["output"][0]["target"]));
        setAudioContent(
          "data:audio/wav;base64," + data["audio"][0]["audioContent"]
        );
        var audio = "data:audio/wav;base64," + data["audio"][0]["audioContent"];
        var audioObject = new Audio(audio);
        audioObject.addEventListener("loadedmetadata", () => {
          setTargetAudioDuration(audioObject.duration);
        });
        setRequestTime(response.headers["request-duration"]);
        setGotOutput(true);
      });
  };

  const handleRecording = (blob: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var result = reader.result as string;
      var base64Data = result.split(",")[1];
      var audio = new Audio("data:audio/wav;base64," + base64Data);
      audio.addEventListener("loadedmetadata", () => {
        setSourceAudioDuration(audio.duration);
      });
      audio.play();
      getASROutput(base64Data);
    };
  };

  const stopRecording = () => {
    setRecording(!recording);
    recorder?.stop();
    audioStream?.getAudioTracks()[0].stop();
    recorder?.exportWAV(handleRecording, "audio/wav", 16000);
    setPlaceHolder("Start Recording for ASR Inference...");
    setFetching(false);
    setFetched(true);
  };

  useEffect(() => {
    const initialLanguageConfig = props.languages[0];
    setLanguage(JSON.stringify(initialLanguageConfig));
  }, []);

  return (
    <>
      <Grid templateRows="repeat(3)" gap={5}>
        <GridItem>
          <Stack direction={"column"}>
            <Stack direction={"row"}>
              <Text className="dview-service-try-option-title">Languages:</Text>
              <Select
                onChange={(e) => {
                  setLanguage(e.target.value);
                }}
                value={language}
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
            <Stack direction={"row"}>
              <Text className="dview-service-try-option-title">Voice:</Text>
              <Select
                value={voiceGender}
                onChange={(e) => {
                  setVoiceGender(e.target.value);
                }}
              >
                <option value={"male"}>Male</option>
                <option value={"female"}>Female</option>
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
                <StatLabel>Source Audio Duration</StatLabel>
                <StatNumber>{sourceAudioDuration}</StatNumber>
                <StatHelpText>seconds</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Target Audio Duration</StatLabel>
                <StatNumber>{targetAudioDuration}</StatNumber>
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
              w={"auto"}
              h={200}
              value={sourceText}
              readOnly
              placeholder={placeholder}
            />
            <Textarea
              w={"auto"}
              h={200}
              value={targetText}
              readOnly
              placeholder={placeholder}
            />
            <Stack direction={"row"} gap={5}>
              {recording ? (
                <Button
                  onClick={() => {
                    stopRecording();
                  }}
                >
                  <FaMicrophone /> Stop
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    startRecording();
                  }}
                >
                  <FaMicrophone size={15} />
                </Button>
              )}
              <Input
                variant={"unstyled"}
                onChangeCapture={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const selectedAudioFile = e.target["files"][0];
                  const selectedAudioReader = new FileReader();
                  selectedAudioReader.readAsDataURL(selectedAudioFile);
                  selectedAudioReader.onloadend = () => {
                    setFetched(false);
                    setFetching(true);
                    var base64Data: string =
                      selectedAudioReader.result as string;
                    var audio = new Audio(
                      "data:audio/wav;base64," + base64Data.split(",")[1]
                    );
                    audio.addEventListener("loadedmetadata", () => {
                      setSourceAudioDuration(audio.duration);
                    });
                    audio.play();
                    getASROutput(base64Data.split(",")[1]);
                    setFetching(false);
                    setFetched(true);
                  };
                }}
                type={"file"}
              />
            </Stack>
            <audio src={audioContent} style={{ width: "100%" }} controls />
            {gotOutput && (
              <FeedbackModal
                pipelineInput={pipelineInput}
                pipelineOutput={pipelineOutput}
              />
            )}
          </Stack>
        </GridItem>
      </Grid>
      {modal}
    </>
  );
};

export default STSTry;
