import {
  Button,
  Grid,
  GridItem,
  Heading,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Box,
  Textarea,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useEffect, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import { apiInstance, dhruvaAPI } from "../api/apiConfig";
import { listServices } from "../api/serviceAPI";
import ContentLayout from "../components/Layouts/ContentLayout";
import { lang2label } from "../config/config";
import useMediaQuery from "../hooks/useMediaQuery";
import { getWordCount } from "../utils/utils";
import {
  PipelineInput,
  PipelineOutput,
} from "../components/Feedback/FeedbackTypes";
import { ULCATaskType } from "../components/Feedback/FeedbackTypes";
import { FeedbackModal } from "../components/Feedback/Feedback";

function PipelineInterface() {
  const { data: services } = useQuery(["services"], listServices);
  const [asrServices, setasrServices] = useState([]);
  const [ttsServices, setttsServices] = useState([]);
  const [nmtServices, setnmtServices] = useState([]);

  const [sourceLanguages, setsourceLanguages] = useState([]);
  const [targetLanguages, settargetLanguages] = useState([]);

  const [sourceLanguage, setsourceLanguage] = useState("");
  const [targetLanguage, settargetLanguage] = useState("");

  const [sourceASRServices, setsourceASRServices] = useState([]);
  const [targetTTSServices, settargetTTSServices] = useState([]);
  const [pairNMTServices, setpairNMTServices] = useState([]);

  const [currentASRService, setcurrentASRService] = useState("");
  const [currentTTSService, setcurrentTTSService] = useState("");
  const [currentNMTService, setcurrentNMTService] = useState("");

  const [fetching, setFetching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<any>(null);
  const [fetched, setFetched] = useState(false);

  const [requestWordCount, setRequestWordCount] = useState(0);
  const [responseWordCount, setResponseWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);

  const [sourceText, setsourceText] = useState("");
  const [targetText, settargetText] = useState("");
  const [audio, setAudio] = useState("");
  const [pipelineInput, setPipelineInput] = useState<
    PipelineInput | undefined
  >();
  const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput>();

  const asrFilter = (service) => {
    return service["task"]["type"] === "asr";
  };
  const ttsFilter = (service) => {
    return service["task"]["type"] === "tts";
  };
  const nmtFilter = (service) => {
    return service["task"]["type"] === "translation";
  };

  useEffect(() => {
    if (services) {
      const availableASRServices = services.filter(asrFilter);
      const availableTTSServices = services.filter(ttsFilter);
      const availableNMTServices = services.filter(nmtFilter);

      setasrServices(availableASRServices);
      setttsServices(availableTTSServices);
      setnmtServices(availableNMTServices);

      const setSourceLanguages = new Set();
      const setTargetLanguages = new Set();

      availableASRServices.map((service) => {
        service.languages.map((language) => {
          setSourceLanguages.add(language.sourceLanguage);
        });
      });

      availableTTSServices.map((service) => {
        service.languages.map((language) => {
          setTargetLanguages.add(language.sourceLanguage);
        });
      });

      const availableSourceLanguages = Array.from(setSourceLanguages);
      const availableTargetLanguages = Array.from(setTargetLanguages);

      setsourceLanguage(availableSourceLanguages[0] as string);
      settargetLanguage(availableTargetLanguages[0] as string);

      setsourceLanguages(availableSourceLanguages);
      settargetLanguages(availableTargetLanguages);
    }
  }, [services]);

  useEffect(() => {
    if (asrServices && sourceLanguage && ttsServices && targetLanguage) {
      const currentsourceASRServices = asrServices.filter((jsonObj) => {
        return jsonObj.languages.some((languageObj) => {
          return languageObj.sourceLanguage === sourceLanguage;
        });
      });

      const currenttargetTTSServices = ttsServices.filter((jsonObj) => {
        return jsonObj.languages.some((languageObj) => {
          return languageObj.sourceLanguage === targetLanguage;
        });
      });

      const currentPairNMTServices = nmtServices.filter((jsonObj) => {
        return jsonObj.languages.some((languageObj) => {
          return (
            languageObj.sourceLanguage === sourceLanguage &&
            languageObj.targetLanguage === targetLanguage
          );
        });
      });

      setcurrentASRService(currentsourceASRServices[0].serviceId);
      setcurrentTTSService(currenttargetTTSServices[0].serviceId);
      if (currentPairNMTServices.length !== 0) {
        setcurrentNMTService(currentPairNMTServices[0].serviceId);
      } else {
        setcurrentNMTService("");
      }
      setsourceASRServices(currentsourceASRServices);
      settargetTTSServices(currenttargetTTSServices);
      setpairNMTServices(currentPairNMTServices);
    }
  }, [sourceLanguage, targetLanguage]);

  const startRecording = () => {
    setRecording(!recording);
    setFetched(false);
    setFetching(true);
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
        console.log(e);
      });
  };

  const handleRecording = (blob: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var result = reader.result as string;
      var base64Data = result.split(",")[1];
      getPipelineOutput(base64Data);
      var audio = new Audio("data:audio/wav;base64," + base64Data);
      audio.play();
    };
  };

  const stopRecording = () => {
    setRecording(!recording);
    recorder?.stop();
    audioStream?.getAudioTracks()[0].stop();
    recorder?.exportWAV(handleRecording, "audio/wav", 16000);
    setFetching(false);
    setFetched(true);
  };

  const getPipelineOutput = (asrInput) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaAPI.pipelineInference,
        {
          pipelineTasks: [
            {
              taskType: "asr",
              config: {
                serviceId: currentASRService,
                language: {
                  sourceLanguage: sourceLanguage,
                },
              },
            },
            {
              taskType: "translation",
              config: {
                serviceId: currentNMTService,
                language: {
                  sourceLanguage: sourceLanguage,
                  targetLanguage: targetLanguage,
                },
              },
            },
            {
              taskType: "tts",
              config: {
                serviceId: currentTTSService,
                language: {
                  sourceLanguage: targetLanguage,
                },
                gender: "male",
              },
            },
          ],
          inputData: {
            input: [],
            audio: [
              {
                audioContent: asrInput,
              },
            ],
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
              taskType: ULCATaskType.ASR,
              config: {
                serviceId: currentASRService,
                language: {
                  sourceLanguage: sourceLanguage,
                },
              },
            },
            {
              taskType: ULCATaskType.TRANSLATION,
              config: {
                serviceId: currentNMTService,
                language: {
                  sourceLanguage: sourceLanguage,
                  targetLanguage: targetLanguage,
                },
              },
            },
            {
              taskType: ULCATaskType.TTS,
              config: {
                serviceId: currentTTSService,
                language: {
                  sourceLanguage: targetLanguage,
                },
                gender: "male",
              },
            },
          ],
          inputData: {
            input: [],
            audio: [
              {
                audioContent: asrInput,
              },
            ],
          },
        });
        setPipelineOutput({
          pipelineResponse: response.data["pipelineResponse"],
        });
        const pipelineData = response.data["pipelineResponse"];
        const nmtOutput = pipelineData[1]["output"][0];
        const audioContent = pipelineData[2]["audio"][0]["audioContent"];
        var audio = "data:audio/wav;base64," + audioContent;
        var audioObject = new Audio(audio);
        audioObject.addEventListener("loadedmetadata", () => {
          setAudioDuration(audioObject.duration);
        });
        setsourceText(nmtOutput["source"]);
        settargetText(nmtOutput["target"]);
        setAudio(audio);
        setFetching(false);
        setFetched(true);
        setRequestWordCount(getWordCount(nmtOutput["source"]));
        setResponseWordCount(getWordCount(nmtOutput["target"]));
        setRequestTime(response.headers["request-duration"]);
      });
  };

  return (
    <>
      <GridItem p="1rem" bg="white" gap={5}>
        <Stack spacing={10} direction={"row"} mb="1rem">
          <Heading>Pipeline (Speech2Speech)</Heading>
        </Stack>
        <Tabs isFitted>
          <TabList mb="1em">
            <Tab _selected={{ textColor: "#DD6B20" }}>Details</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Text className="dview-service-description">
                The Pipeline Interface can be used to chain various services
                such as ASR,TTS and NMT to build complex tasks such as
                Speech2Speech.
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </GridItem>
      <GridItem p="1rem" bg="white">
        <Stack spacing={5} direction={"column"}>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">Source:</Text>
            <Select
              value={sourceLanguage}
              color={"gray.600"}
              onChange={(e) => {
                setsourceLanguage(e.target.value);
              }}
            >
              {sourceLanguages.map((language) => {
                return (
                  <option key={language} value={language}>
                    {lang2label[language]}
                  </option>
                );
              })}
            </Select>
          </Stack>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">Target:</Text>
            <Select
              value={targetLanguage}
              color={"gray.600"}
              onChange={(e) => {
                settargetLanguage(e.target.value);
              }}
            >
              {targetLanguages.map((language) => {
                return (
                  <option key={language} value={language}>
                    {lang2label[language]}
                  </option>
                );
              })}
            </Select>
          </Stack>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">ASR:</Text>
            <Select
              value={currentASRService}
              color={"gray.600"}
              onChange={(e) => {
                setcurrentASRService(e.target.value);
              }}
            >
              {sourceASRServices.map((service) => {
                return (
                  <option key={service.serviceId}>{service.serviceId}</option>
                );
              })}
            </Select>
          </Stack>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">TTS:</Text>
            <Select
              color={"gray.600"}
              value={currentTTSService}
              onChange={(e) => {
                setcurrentTTSService(e.target.value);
              }}
            >
              {targetTTSServices.map((service) => {
                return (
                  <option key={service.serviceId}>{service.serviceId}</option>
                );
              })}
            </Select>
          </Stack>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">NMT:</Text>
            <Select
              color={"gray.600"}
              value={currentNMTService}
              onChange={(e) => {
                setcurrentNMTService(e.target.value);
              }}
            >
              {pairNMTServices.map((service) => {
                return (
                  <option key={service.serviceId}>{service.serviceId}</option>
                );
              })}
            </Select>
          </Stack>
          <Stack direction={"column"}>
            <Stack direction={"row"}>
              {recording ? (
                <Button
                  w="50%"
                  onClick={() => {
                    stopRecording();
                  }}
                >
                  <FaMicrophone /> Stop
                </Button>
              ) : (
                <Button
                  w="50%"
                  onClick={() => {
                    startRecording();
                  }}
                >
                  <FaMicrophone size={15} />
                </Button>
              )}
              <Button
                as="label"
                htmlFor="file-input"
                cursor="pointer"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
                padding="0.5rem 1rem"
                w={"50%"}
                _hover={{ bg: "gray.75" }}
                _active={{ bg: "gray.100" }}
              >
                Choose file
                <input
                  id="file-input"
                  type="file"
                  style={{ display: "none" }}
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
                      // audio.play();
                      getPipelineOutput(base64Data.split(",")[1]);
                      setFetching(false);
                      setFetched(true);
                    };
                    e.target.value = null;
                  }}
                />
              </Button>
            </Stack>
            {fetching ? <Progress size="xs" isIndeterminate /> : <></>}
            {fetched ? (
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
                <Stat>
                  <StatLabel>TTS Audio Duration</StatLabel>
                  <StatNumber>{audioDuration}</StatNumber>
                  <StatHelpText>seconds</StatHelpText>
                </Stat>
              </SimpleGrid>
            ) : (
              <></>
            )}
            <Textarea readOnly value={sourceText} />
            <Textarea readOnly value={targetText} />
            <audio style={{ width: "auto" }} src={audio} controls />
            {pipelineOutput && (
              <FeedbackModal
                pipelineInput={pipelineInput}
                pipelineOutput={pipelineOutput}
                taskType={[ULCATaskType.ASR, ULCATaskType.TRANSLATION, ULCATaskType.TTS]}
              />
            )}
          </Stack>
        </Stack>
      </GridItem>
    </>
  );
}

export default function Pipeline() {
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  return (
    <>
      <Head>Pipelines</Head>
      <ContentLayout>
        {smallscreen ? (
          <Grid
            ml="1rem"
            mr="1rem"
            mb="1rem"
            minW={"90vw"}
            maxW={"90vw"}
            gap={10}
          >
            <PipelineInterface />
          </Grid>
        ) : (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={5}
            className="service-view"
            bg="light.100"
          >
            <PipelineInterface />
          </Grid>
        )}
      </ContentLayout>
    </>
  );
}
