import {
  Stack,
  Text,
  Select,
  Button,
  Textarea,
  Progress,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaRegFileAudio } from "react-icons/fa";
import { useState, useEffect } from "react";
// import { IndicTransliterate } from "../indic-transliterate/dist/index.modern";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { dhruvaConfig, lang2label, apiInstance } from "../../config/config";
import { getWordCount } from "../../utils/utils";

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
  const [fetched, setFetched] = useState(false);
  const [requestWordCount, setRequestWordCount] = useState(0);
  const [requestTime, setRequestTime] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);

  const getTTSAudio = (source: string) => {
    setFetched(false);
    setFetching(true);
    apiInstance
      .post(
        dhruvaConfig.ttsInference + `?serviceId=${props.serviceId}`,
        {
          input: [
            {
              source: source,
            },
          ],
          config: {
            language: {
              sourceLanguage: language,
            },
            gender: voice,
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
        var audioContent = response.data["audio"][0]["audioContent"];
        var audio = "data:audio/wav;base64," + audioContent;
        var audioObject = new Audio(audio);
        audioObject.addEventListener("loadedmetadata", () => {
          setAudioDuration(audioObject.duration);
        });
        setAudio(audio);
        setFetching(false);
        setFetched(true);
        setRequestWordCount(getWordCount(tltText));

        setRequestTime(response.headers["request-duration"]);
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
    setLanguage(uniqueSourceLanguages[0]);
  }, []);

  const renderTransliterateComponent = () => {
    return (
      <IndicTransliterate
        renderComponent={(props) => (
          <Textarea resize="none" h={200} {...props} />
        )}
        onChangeText={(text: string) => {
          setTltText(text);
        }}
        value={tltText}
        placeholder="Type your text here to generate audio..."
        lang={language}
        onChange={undefined}
        onBlur={undefined}
        onKeyDown={undefined}
        enabled={language !== "en"}
      />
    );
  };

  return (
    <>
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
              <StatLabel>Word Count</StatLabel>
              <StatNumber>{requestWordCount}</StatNumber>
              <StatHelpText>Request</StatHelpText>
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
        </GridItem>
      ) : (
        <></>
      )}
      <GridItem>
        <Stack>
          {renderTransliterateComponent()}
          <Stack direction={"column"} gap={5}>
            <Button
              onClick={() => {
                getTTSAudio(tltText);
              }}
            >
              <FaRegFileAudio />
            </Button>
            <audio style={{ width: "auto" }} src={audio} controls />
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
    </>
  );
}