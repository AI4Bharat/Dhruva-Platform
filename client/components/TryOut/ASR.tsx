import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Grid,
  GridItem,
  Progress,
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
  const [language, setLanguage] = useState("hi");
  const [audioText, setAudioText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sampleRate, setSampleRate] = useState(16000);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recorder, setRecorder] = useState<MediaRecorder>(null);

  const startRecording = () => {
    setRecording(!recording);
    setAudioText("Recording Audio...");

    recorder!.ondataavailable = (e: BlobEvent) => {
      audioChunks.push(e.data);
    };
    recorder!.onstop = (e) => {
      console.log("Recording Done...");
    };

    recorder!.start(0.5);
  };

  const getASROutput = (asrInput: string) => {};

  const stopRecording = () => {
    setRecording(!recording);
    recorder!.stop();
    let blob = new Blob(audioChunks, { type: "audio/wav" });
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64Data = reader.result;
      console.log(base64Data);
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
            placeholder="Start Recording for ASR Inference..."
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
                <FaMicrophone /> Record
              </Button>
            )}
            <Button>
              <FaRegCopy /> Copy
            </Button>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  );
}
