import {
  Box,
  Heading,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Grid,
  GridItem,
  Select,
  Textarea,
  Button,
  Input,
} from "@chakra-ui/react";
import ContentLayout from "../components/Layouts/ContentLayout";
import Head from "next/head";
import useMediaQuery from "../hooks/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import { listServices } from "../api/serviceAPI";
import { useState, useEffect } from "react";
import { lang2label } from "../config/config";
import { FaMicrophone } from "react-icons/fa";
import { apiInstance } from "../api/apiConfig";
import { dhruvaAPI } from "../api/apiConfig";

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

  const logConfig = () => {
    console.log([
      sourceLanguage,
      targetLanguage,
      currentASRService,
      currentTTSService,
      currentNMTService,
    ]);
  };

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
      // var audio = new Audio("data:audio/wav;base64," + base64Data);
      // audio.play();
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
    apiInstance
      .post(
        dhruvaAPI.pipelineInference,
        {
          pipelineTasks: [
            {
              taskType: "translation",
              config: {
                serviceId: "",
                language: {
                  sourceLanguage: "en",
                  sourceScriptCode: "",
                  targetLanguage: "ta",
                  targetScriptCode: "",
                },
              },
            },
          ],
          inputData: {
            input: [
              {
                source: "who is there?",
              },
            ],
            audio: [{}],
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
        const data = response;
        console.log(data);
      });
  };

  return (
    <>
      <GridItem p="1rem" bg="white" gap={5}>
        <Stack spacing={10} direction={"row"} mb="1rem">
          <Heading>Pipeline</Heading>
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
                  }}
                />
              </Button>
            </Stack>
            <Textarea readOnly></Textarea>
            <Textarea readOnly></Textarea>
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
