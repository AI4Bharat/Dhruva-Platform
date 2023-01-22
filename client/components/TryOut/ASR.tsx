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
import { IndicTransliterate } from "../indic-transliterate/dist/index.modern";
import { useState, useEffect } from "react";
import axios from "axios";
import { dhruvaConfig, lang2label, apiInstance } from "../../config/config";
import { getWordCount } from "../../utils/utils";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function ASRTry({ ...props }) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  const [audioText, setAudioText] = useState("");
  const [placeholder, setPlaceHolder] = useState(
    "Start Recording for ASR Inference..."
  );
  const [fetching, setFetching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sampleRate, setSampleRate] = useState<number>(16000);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recorder, setRecorder] = useState<MediaRecorder>(null);
  const [fetched, setFetched] = useState(false);
  const [responseWordCount, setResponseWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");
  const [audioStart, setAudioStart] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const startRecording = () => {
    setAudioStart(Date.now());
    setRecording(!recording);
    setFetched(false);
    setFetching(true);
    setPlaceHolder("Recording Audio....");
    recorder!.ondataavailable = (e: BlobEvent) => {
      audioChunks.push(e.data);
    };
    recorder!.onstop = (e) => {
      console.log("Recording Done...");
    };

    recorder!.start(0.5);
  };

  const getASROutput = (asrInput: string) => {
    apiInstance
      .post(
        dhruvaConfig.asrInference,
        {
          serviceId: props.serviceId,
          audio: [
            {
              audioContent: asrInput,
            },
          ],
          config: {
            language: {
              sourceLanguage: language,
            },
            audioFormat: "wav",
            encoding: "base64",
            samplingRate: sampleRate,
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
        var output = response.data.output[0].source;
        setAudioText(output);
        setResponseWordCount(getWordCount(output));
        setRequestTime(response.headers["request-duration"]);
      });
  };

  const stopRecording = () => {
    setRecording(!recording);
    setPlaceHolder("Start Recording for ASR Inference...");
    recorder!.stop();
    setAudioDuration(Date.now() - audioStart);
    let blob = new Blob(audioChunks, { type: "audio/wav" });
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64Data: string = reader.result as string;
      getASROutput(base64Data.split(",")[1]);
      setAudioChunks([]);
    };
    setFetching(false);
    setFetched(true);
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      var newRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setRecorder(newRecorder);
    });

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
            <Text className="dview-service-try-option-title">Sample Rate:</Text>
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
              <StatLabel>ASR Audio Duration</StatLabel>
              <StatNumber>{audioDuration / 1000}</StatNumber>
              <StatHelpText>seconds</StatHelpText>
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
            w={"auto"}
            h={200}
            readOnly
            value={audioText}
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
                  var base64Data: string = selectedAudioReader.result as string;
                  var audioObject = new Audio(base64Data);
                  audioObject.addEventListener("loadedmetadata", () => {
                    setAudioDuration(audioObject.duration);
                  });
                  getASROutput(base64Data.split(",")[1]);
                };
              }}
              type={"file"}
            />
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  );
}
