import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Progress,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";

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

export default function NMTTry({ ...props }) {
  const [fromLanguages, setFromLanguages] = useState<string[]>([]);
  const [toLanguages, setToLanguages] = useState<string[]>([]);
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("hi");
  const [tltText, setTltText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const uniqueSourceLanguages: any = Array.from(
      new Set(
        props.languages.map(
          (language: LanguageConfig) => language.sourceLanguage
        )
      )
    );
    setFromLanguages(uniqueSourceLanguages);
    const uniqueTargetLanguages: any = Array.from(
      new Set(
        props.languages.map((language: LanguageConfig) => {
          if (language.sourceLanguage === fromLanguage) {
            return language.targetLanguage;
          }
        })
      )
    );
    setToLanguages(uniqueTargetLanguages);
  }, []);

  const getTranslation = (source: string, from: string, to: string) => {
    setFetching(true);
    axios({
      method: "POST",
      url: "https://api.dhruva.co/services/inference/translation",
      data: {
        serviceId: props.serviceId,
        input: [
          {
            source: source,
          },
        ],
        config: {
          language: {
            sourceLanguage: from,
            targetLanguage: to,
          },
        },
      },
    }).then((response) => {
      setTranslatedText(response.data["output"][0]["target"]);
      setFetching(false);
    });
  };

  const clearIO = () => {
    setTltText("");
    setTranslatedText("");
  };

  return (
    <Stack spacing={5} w={"100%"}>
      <Stack direction={"row"} spacing={50}>
        <Stack direction={"row"}>
          <Text className="dview-service-try-option-title">From:</Text>
          <Select
            onChange={(e) => {
              clearIO();
              setFromLanguage(e.target.value);
              const uniqueTargetLanguages: any = Array.from(
                new Set(
                  props.languages.map((language: LanguageConfig) => {
                    if (language.sourceLanguage === e.target.value) {
                      return language.targetLanguage;
                    }
                  })
                )
              );
              setToLanguages(uniqueTargetLanguages);
            }}
            value={fromLanguage}
          >
            {fromLanguages.map((language) => (
              <option key={language} value={language}>
                {lang2label[language]}
              </option>
            ))}
          </Select>
        </Stack>
        <Stack direction={"row"}>
          <Text className="dview-service-try-option-title">To:</Text>
          <Select
            onChange={(e) => {
              clearIO();
              setToLanguage(e.target.value);
            }}
            value={toLanguage}
          >
            {toLanguages.map((language) => (
              <option key={language} value={language}>
                {lang2label[language]}
              </option>
            ))}
          </Select>
        </Stack>
      </Stack>
      {fetching ? <Progress size="xs" isIndeterminate /> : <></>}
      <Stack direction={"row"}>
        <Stack>
          <Textarea
            value={tltText}
            onChange={(e) => {
              setTltText(e.target.value);
            }}
            w={"auto"}
            h={200}
            placeholder="Type your text here to translate..."
          />
          <Textarea
            readOnly
            value={translatedText}
            w={"auto"}
            h={200}
            placeholder="View Translation Here..."
          />
          <Button
            onClick={() => {
              getTranslation(tltText, fromLanguage, toLanguage);
            }}
          >
            Translate
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
