import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Progress,
} from "@chakra-ui/react";
import { FaRegFileAudio } from "react-icons/fa";
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

export default function TTSTry({ ...props }) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState("hi");
  const [voice, setVoice] = useState("male");
  const [tltText, setTltText] = useState("");
  const [audio, setAudio] = useState("");
  const [fetching, setFetching] = useState(false);

  const getTTSAudio = () => {
    setFetching(true);
    axios({
      method: "POST",
      url: "https://api.dhruva.co/services/inference/tts",
      data: {
        serviceId: props.serviceId,
        input: [
          {
            source: tltText,
          },
        ],
        config: {
          language: {
            sourceLanguage: language,
          },
          gender: voice,
        },
      },
    }).then((response) => {
      var audioContent = response.data["audio"][0]["audioContent"];
      var audio = "data:audio/wav;base64," + audioContent;
      setAudio(audio);
      setFetching(false);
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
  }, []);

  return (
    <>
      <Stack direction={"row"} spacing={50}>
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
          <Text className="dview-service-try-option-title">Voice:</Text>
          <Select
            onChange={(e) => {
              setVoice(e.target.value);
            }}
          >
            <option value={"male"}>Male</option>
            <option value={"female"}>Female</option>
          </Select>
        </Stack>
      </Stack>
      {fetching ? <Progress size="xs" isIndeterminate /> : <></>}
      <Stack direction={"row"}>
        <Button
          onClick={() => {
            getTTSAudio();
          }}
        >
          <FaRegFileAudio />
        </Button>
        <Stack>
          <Textarea
            value={tltText}
            onChange={(e) => {
              setTltText(e.target.value);
            }}
            w={"auto"}
            h={200}
            placeholder="Type your text here to generate audio..."
          />
          <audio src={audio} controls />
        </Stack>
      </Stack>
    </>
  );
}
