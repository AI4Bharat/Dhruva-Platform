import { CloseIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Box,
  Button,
  Select,
  useToast,
  Input,
  Switch,
  Checkbox,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { BiCross } from "react-icons/bi";
import { submitFeedback } from "../../api/serviceAPI";
import { lang2label } from "../../config/config";
import { PipelineInput, PipelineOutput, ULCAFeedbackRequest } from "./Feedback";

import Rating from "./Rating";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface IFeedback {
  language: LanguageConfig;
  example: string;
  rating: number;
  comments: string;
  service_id: string;
}
enum ULCATaskType {
  ASR = "asr",
  TRANSLATION = "translation",
  TTS = "tts",
  TRANSLITERATION = "transliteration",
  NER = "ner",
  STS = "sts", // TODO: Remove
}
enum FeedbackType {
  RATING = "rating",
  COMMENT = "comment",
  THUMBS = "thumbs",
  RATING_LIST = "ratingList",
  COMMENT_LIST = "commentList",
  THUMBS_LIST = "thumbsList",
  CHECKBOX_LIST = "checkboxList",
}

const Feedback = (props) => {
  const [feedback, setFeedback] = useState<any>({
    feedbackLanguage: "",
    pipelineFeedback: {
      commonFeedback: [
        {
          feedbackType: FeedbackType.RATING_LIST,
          question: "How would you rate the overall quality of the output?",
          rating: 0,
        },
      ],
    },
    taskFeedback: [
      {
        taskType: ULCATaskType.ASR,
        commonFeedback: [],
        granularFeedback: [],
      },
    ],
  });

  const [pipelineInput, setPipelineInput] = useState<PipelineInput>({
    inputData: [],
    controlConfig: {
      dataTracking: false,
    },
    pipelineTasks: [],
  });

  const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput>({
    pipelineResponse: [],
    controlConfig: {
      dataTracking: false,
    },
  });

  const [suggestedPipelineOutput, setSuggestedPipelineOutput] =
    useState<PipelineOutput>({
      pipelineResponse: [],
      controlConfig: {
        dataTracking: false,
      },
    });
  return (
    <>
      <FormControl>
        <FormLabel>
          <Text fontSize="lg" fontWeight="bold">
            Feedback Language
          </Text>
        </FormLabel>
        <Input value={feedback.feedbackLanguage} />
      </FormControl>
      <FormControl>
        <FormLabel>
          <Text fontSize="lg" fontWeight="bold">
            Pipeline Input
          </Text>
        </FormLabel>
        <Checkbox>Data Tracking</Checkbox>
        {pipelineInput.inputData.map((data, index) => (
          <HStack key={index} mb="1%">
            <Input value={data} placeholder="Input Data" />
            <Input value={data} placeholder="Input Config" />
            <IconButton
              aria-label="Delete"
              icon={<CloseIcon />}
              variant={"ghost"}
              onClick={() =>
                setPipelineInput({
                  ...pipelineInput,
                  inputData: pipelineInput.inputData.filter(
                    (_, i) => i !== index
                  ),
                })
              }
            />
          </HStack>
        ))}
        <Button
          w="100%"
          onClick={() =>
            setPipelineInput({
              ...pipelineInput,
              inputData: [...pipelineInput.inputData, ""],
            })
          }
        >
          Add Input
        </Button>
      </FormControl>
      <FormControl>
        <FormLabel>
          <Text fontSize="lg" fontWeight="bold">
            Pipeline Output
          </Text>
        </FormLabel>
        <Checkbox>Data Tracking</Checkbox>
        {pipelineOutput.pipelineResponse.map((data, index) => (
          <HStack>
            <Input mb="1%" key={index} value={data} placeholder="Output Data" />
            <IconButton
              aria-label="Delete"
              variant={"ghost"}
              icon={<CloseIcon />}
              onClick={() => {
                setPipelineOutput({
                  ...pipelineOutput,
                  pipelineResponse: pipelineOutput.pipelineResponse.filter(
                    (_, i) => i !== index
                  ),
                });
              }}
            />
          </HStack>
        ))}
        <Button
          w="100%"
          onClick={() => {
            setPipelineOutput({
              ...pipelineOutput,
              pipelineResponse: [...pipelineOutput.pipelineResponse, ""],
            });
          }}
        >
          Add Output
        </Button>
      </FormControl>
      <FormControl>
        <FormLabel>
          <Text fontSize="lg" fontWeight="bold">
            Suggested Pipeline Output
          </Text>
        </FormLabel>
        <Checkbox>Data Tracking</Checkbox>
        {suggestedPipelineOutput.pipelineResponse.map((data, index) => (
          <HStack>
            <Input mb="1%" key={index} value={data} placeholder="Output Data" />
            <IconButton
              aria-label="Delete"
              variant={"ghost"}
              icon={<CloseIcon />}
              onClick={() => {
                setSuggestedPipelineOutput({
                  ...suggestedPipelineOutput,
                  pipelineResponse:
                    suggestedPipelineOutput.pipelineResponse.filter(
                      (_, i) => i !== index
                    ),
                });
              }}
            />
          </HStack>
        ))}
        <Button
          w="100%"
          onClick={() => {
            setSuggestedPipelineOutput({
              ...suggestedPipelineOutput,

              pipelineResponse: [
                ...suggestedPipelineOutput.pipelineResponse,
                "",
              ],
            });
          }}
        >
          Add Output
        </Button>
      </FormControl>

      <Button mt={"2rem"} type="submit">
        Submit
      </Button>
    </>
  );
};

export default Feedback;
