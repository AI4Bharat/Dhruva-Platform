import { Stack, Text, Select, Button, Textarea } from "@chakra-ui/react";
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
          <Text className="dview-service-try-option-title">Sample Rate:</Text>
          <Select>
            <option value={16000}>16000 kHz</option>
            <option value={8000}>8000 kHz</option>
          </Select>
        </Stack>
      </Stack>
      <Stack direction={"row"}>
        <Stack spacing={5}>
          <Button>
            <FaMicrophone />
          </Button>
          <Button>
            <FaRegCopy />
          </Button>
        </Stack>
        <Textarea
          w={500}
          h={200}
          readOnly
          value={audioText}
          placeholder="Start Recording for ASR Inference..."
        />
      </Stack>
    </>
  );
}
