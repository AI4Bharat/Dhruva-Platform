import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Progress,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";

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
  const [language, setLanguage] = useState(
    JSON.stringify({
      sourceLanguage: "en",
      targetLanguage: "hi",
    })
  );
  const [tltText, setTltText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fetching, setFetching] = useState(false);

  const getTranslation = (source: string) => {
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
          language: JSON.parse(language),
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

  const renderTransliterateComponent = () => {
    const currentLanguage: LanguageConfig = JSON.parse(language);
    return (
      <IndicTransliterate
        renderComponent={(props) => (
          <Textarea resize="none" h={200} {...props} />
        )}
        onChangeText={(text) => {
          setTltText(text);
        }}
        value={tltText}
        placeholder="Type your text here to transliterate...."
        lang={currentLanguage.sourceLanguage}
      />
    );
  };

  return (
    <Grid templateRows="repeat(3)" gap={5}>
      <GridItem>
        <Stack direction={"row"}>
          <Stack direction={"row"}>
            <Text className="dview-service-try-option-title">Languages:</Text>

            <Select
              onChange={(e) => {
                clearIO();
                setLanguage(e.target.value);
              }}
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
        </Stack>
      </GridItem>
      <GridItem>
        {fetching ? <Progress size="xs" isIndeterminate /> : <></>}
      </GridItem>
      <GridItem>
        <Stack>
          {/* <Textarea
            value={tltText}
            onChange={(e) => {
              setTltText(e.target.value);
            }}
            w={"auto"}
            resize="none"
            h={200}
            placeholder="Type your text here to translate..."
          /> */}
          {renderTransliterateComponent()}
          <Textarea
            readOnly
            value={translatedText}
            w={"auto"}
            resize="none"
            h={200}
            placeholder="View Translation Here..."
          />
          <Button
            onClick={() => {
              getTranslation(tltText);
            }}
          >
            Translate
          </Button>
        </Stack>
      </GridItem>
    </Grid>
  );
}
