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
  useToast,
} from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { dhruvaAPI, apiInstance } from "../../api/apiConfig";
import { lang2label } from "../../config/config";
import { getWordCount } from "../../utils/utils";
import {
  StreamingClient,
  SocketStatus,
} from "@project-sunbird/open-speech-streaming-client";
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

const ASRTry: React.FC<Props> = (props) => {
  const [streamingClient, setStreamingClient] = useState(new StreamingClient());

  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  const [audioText, setAudioText] = useState("");
  const [placeholder, setPlaceHolder] = useState(
    "Start Recording for ASR Inference..."
  );
  const [fetching, setFetching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sampleRate, setSampleRate] = useState<number>(16000);
  const [recorder, setRecorder] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<any>(null);
  const [fetched, setFetched] = useState(false);
  const [responseWordCount, setResponseWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");

  const [inferenceMode, setInferenceMode] = useState("rest");

  const [permission, setPermission] = useState<boolean>(true);
  const [modal, setModal] = useState(<></>);

  const toast = useToast();

  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [pipelineInput, setPipelineInput] = useState<
    PipelineInput | undefined
  >();
  const [pipelineOutput, setPipelineOutput] = useState<
    PipelineOutput | undefined
  >();
  const getASROutput = (asrInput: string) => {
    apiInstance
      .post(
        dhruvaAPI.asrInference + `?serviceId=${props.serviceId}`,
        {
          audio: [
            {
              audioContent: asrInput,
            },
          ],
          config: {
            language: {
              sourceLanguage: language,
            },
            serviceId: props.serviceId,
            audioFormat: "wav",
            encoding: "base64",
            samplingRate: sampleRate,
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
                audioFormat: "wav",
                encoding: "base64",
                samplingRate: sampleRate,
              },
              taskType: ULCATaskType.ASR,
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
              taskType: ULCATaskType.ASR,
              output: response.data.output,
            },
          ],
        });
        var output = response.data.output[0].source;
        setAudioText(output);
        setResponseWordCount(getWordCount(output));
        setRequestTime(response.headers["request-duration"]);
      });
  };

  const handleRecording = (blob: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var result = reader.result as string;
      var base64Data = result.split(",")[1];
      var audio = new Audio("data:audio/wav;base64," + base64Data);
      audio.play();
      getASROutput(base64Data);
    };
  };

  const startStreaming = () => {
    setStreamingText("");
    setStreaming(true);
    setFetching(true);
    streamingClient.connect(
      dhruvaAPI.asrStreamingInference,
      props.serviceId,
      process.env.NEXT_PUBLIC_API_KEY,
      language,
      sampleRate,
      [],
      function (action: any, id: any) {
        if (action === SocketStatus.CONNECTED) {
          console.log("Connected");
          streamingClient.startStreaming(function (transcript: string) {
            setStreamingText(transcript);
          });
        } else if (action === SocketStatus.TERMINATED) {
          console.log("Terminated");
        } else {
          console.log("Action: ", action, id);
        }
      }
    );
  };

  const stopStreaming = () => {
    console.log("Streaming Ended.");
    streamingClient.stopStreaming();
    streamingClient.disconnect();
    setStreaming(false);
    setFetching(false);
  };

  const startRecording = () => {
    var AudioContext = window.AudioContext;
    var audioContext = new AudioContext();
    var input = audioContext.createMediaStreamSource(audioStream);
    var Recorder = (window as any).Recorder;
    var newRecorder = new Recorder(input, { numChannels: 1 });
    newRecorder.record();
    setRecorder(newRecorder);
    console.log("Recording Started");
    setRecording(true);
    setFetched(false);
    setFetching(true);
    setPlaceHolder("Recording Audio....");

    // Start the timer
    setTimer(0);
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    // Save the interval ID in the state to clear it later
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    console.log("Recording Stopped");
    setRecording(false);
    audioStream.getAudioTracks()[0].stop();
    recorder.exportWAV(handleRecording, "audio/wav", 16000);
    recorder.stop();
    setPlaceHolder("Start Recording for ASR Inference...");
    setFetching(false);
    setFetched(true);
    // Clear the timer interval
    clearInterval(timerInterval);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setAudioStream(stream);
      })
      .catch((e: any) => {
        setPermission(false);
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
      });
  }, [recording]);

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

  return (
    <>
      <Grid templateRows="repeat(3)" gap={5}>
        <GridItem>
          <Stack direction={"column"}>
            <Stack direction={"row"}>
              <Text className="dview-service-try-option-title">
                Inference Mode:
              </Text>
              <Select
                onChange={(e) => {
                  setInferenceMode(e.target.value);
                }}
              >
                <option value={"rest"}>REST</option>
                <option value={"streaming"}>Streaming</option>
              </Select>
            </Stack>
            <Stack direction={"row"}>
              <Text className="dview-service-try-option-title">
                Select Language:
              </Text>
              <Select
                onChange={(e) => {
                  setLanguage(e.target.value);
                }}
                value={language}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {lang2label[language]}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack direction={"row"}>
              <Text className="dview-service-try-option-title">
                Sample Rate:
              </Text>
              <Select
                onChange={(e) => {
                  setSampleRate(Number(e.target.value));
                }}
              >
                <option value={48000}>48000 Hz</option>
                <option value={16000}>16000 Hz</option>
                <option value={8000}>8000 Hz</option>
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
        {inferenceMode === "rest" ? (
          <GridItem>
            <Stack>
              <Textarea
                w={"auto"}
                h={200}
                readOnly
                value={audioText}
                placeholder={placeholder}
              />
              {recording && (
                //@ts-ignore
                <Text color={"gray.300"}>
                  Recording Time : {timer} / 120 seconds
                  {timer >= 120 &&
                    toast({
                      title: "Audio time limit exceeded",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                    }) &&
                    stopRecording()}
                </Text>
              )}
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
                      if (permission) {
                        startRecording();
                      }
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
                      audio.play();

                      getASROutput(base64Data.split(",")[1]);
                      setFetching(false);
                      setFetched(true);
                    };
                  }}
                  type={"file"}
                />
              </Stack>
            </Stack>
            {pipelineOutput && (
              <FeedbackModal
                pipelineInput={pipelineInput}
                pipelineOutput={pipelineOutput}
                taskType={ULCATaskType.ASR}
              />
            )}
          </GridItem>
        ) : (
          <GridItem>
            <Stack gap={5}>
              <Textarea
                w={"auto"}
                h={200}
                readOnly
                value={streamingText}
                placeholder={placeholder}
              />
              <Stack direction={"column"}>
                {streaming ? (
                  <Button
                    onClick={() => {
                      stopStreaming();
                    }}
                  >
                    <FaMicrophone /> Stop
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      startStreaming();
                    }}
                  >
                    <FaMicrophone size={15} />
                  </Button>
                )}
              </Stack>
            </Stack>
          </GridItem>
        )}
      </Grid>
      {modal}
    </>
  );
};

export default ASRTry;
