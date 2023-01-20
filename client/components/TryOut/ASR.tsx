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
} from "@chakra-ui/react";
import { FaRegCopy, FaMicrophone } from "react-icons/fa";

import { useState, useEffect } from "react";
import axios from "axios";

const lang2label: { [key: string]: string } = {
  hi: "Hindi",
  ta: "Tamil",
  en: "English",
  te: "Telugu",
  as: "Assamese",
  bn: "Bengali",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  or: "Oriya",
  gu: "Gujarati",
};

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
  const [sampleRate, setSampleRate] = useState(16000);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recorder, setRecorder] = useState<MediaRecorder>(null);

  const startRecording = () => {
    setRecording(!recording);
    setPlaceHolder("Recording Audio....");
    setFetching(!fetching);
    recorder!.ondataavailable = (e: BlobEvent) => {
      audioChunks.push(e.data);
    };
    recorder!.onstop = (e) => {
      console.log("Recording Done...");
    };

    recorder!.start(0.5);
  };

  const getASROutput = (asrInput: string) => {
    axios({
      method: "POST",
      url: "https://api.dhruva.co/services/inference/asr",
      headers: {
        accept: "application/json",
        authorization: process.env.NEXT_PUBLIC_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
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
    }).then((response) => {
      setAudioText(response.data.output[0].source);
    });
  };

  const stopRecording = () => {
    setRecording(!recording);
    setFetching(!fetching);
    setPlaceHolder("Start Recording for ASR Inference...");
    recorder!.stop();
    let blob = new Blob(audioChunks, { type: "audio/wav" });
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64Data: string = reader.result as string;
      getASROutput(base64Data.split(",")[1]);
      setAudioChunks([]);
    };
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setRecorder(new MediaRecorder(stream, { mimeType: "audio/webm" }));
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
        <Stack direction={"row"}>
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
            <Select>
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
