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
} from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { dhruvaConfig, lang2label, apiInstance } from "../../config/config";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function STSTry({ ...props }) {
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

  const startRecording = () => {
    setRecording(!recording);
    setFetched(false);
    setFetching(true);
    setPlaceHolder("Recording Audio....");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setAudioStream(stream);
      var AudioContext = window.AudioContext;
      var audioContext = new AudioContext();
      var input = audioContext.createMediaStreamSource(stream);
      var Recorder = (window as any).Recorder;
      var newRecorder = new Recorder(input, { numChannels: 1 });
      setRecorder(newRecorder);
      newRecorder.record();
      console.log("Recording started");
    });
  };

  const getASROutput = (asrInput: string) => {
    apiInstance
      .post(
        dhruvaConfig.stsInference,
        {
          serviceId: "lol",
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
        const data = response.data;
        setSourceText(data["output"][0]["source"]);
        setTargetText(data["output"][0]["target"]);
        setAudioContent(
          "data:audio/wav;base64," + data["audio"][0]["audioContent"]
        );
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

  const stopRecording = () => {
    setRecording(!recording);
    recorder.stop();
    audioStream.getAudioTracks()[0].stop();
    recorder.exportWAV(handleRecording, "audio/wav", 16000);
    setPlaceHolder("Start Recording for ASR Inference...");
    setFetching(false);
    setFetched(true);
  };

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
          </Stack>
        </GridItem>
      </Grid>
    </>
  );
}
