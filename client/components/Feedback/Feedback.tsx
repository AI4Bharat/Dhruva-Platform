import { StarIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Box,
  Button,
  Input,
  Switch,
  Checkbox,
  HStack,
  Modal,
  ModalHeader,
  useDisclosure,
  ModalBody,
  ModalOverlay,
  ModalContent,
  VStack,
  Divider,
  Spacer,
  CheckboxGroup,
  ModalCloseButton,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PipelineInput,
  PipelineOutput,
  ULCAFeedbackRequest,
} from "./FeedbackTypes";
import { fetchFeedbackQuestions, submitFeedback } from "../../api/serviceAPI";
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

interface FeedbackProps {
  feedbackLanguage: string;
  pipelineInput: PipelineInput;
  pipelineOutput: PipelineOutput;
  taskType?: ULCATaskType;
}

const Feedback: React.FC<FeedbackProps> = ({
  feedbackLanguage,
  pipelineInput,
  pipelineOutput,
  taskType,
}) => {
  const [feedback, setFeedback] = useState<any>({
    feedbackLanguage: feedbackLanguage,
    pipelineFeedback: {
      commonFeedback: [
        {
          feedbackType: FeedbackType.RATING,
          question: "How would you rate the overall quality of the output?",
          rating: 0,
        },
      ],
    },
    taskFeedback: [
      {
        taskType: ULCATaskType.ASR,
        commonFeedback: [
          {
            feedbackType: FeedbackType.RATING,
            question: "How would you rate the overall quality of the output?",
            rating: 0,
          },
        ],
        granularFeedback: [
          {
            feedbackType: FeedbackType.RATING_LIST,
            question: "How would you rate the overall quality of the output?",
            ratingList: [
              {
                parameterName: "parameter1",
                checkbox: false,
              },
              {
                parameterName: "parameter2",
                checkbox: false,
              },
            ],
          },
          {
            feedbackType: FeedbackType.THUMBS,
            question: "How would you rate the overall quality of the output?",
            rating: 0,
          },
        ],
      },
    ],
  });
  const [suggest, setSuggest] = useState(false);
  const [suggestedPipelineOutput, setSuggestedPipelineOutput] =
    useState<PipelineOutput>(pipelineOutput);
  const toast = useToast();
  const fetchQuestions = () => {
    const response = fetchFeedbackQuestions({
      feedbackLanguage: feedbackLanguage,
      supportedTasks: [ULCATaskType.ASR],
    });
    //TODO: Write parsing function for state management
    setFeedback(response);
  };

  const changeFeedbackState = (
    index,
    value,
    feedbackLocation,
    parentIndex = -1,
    feedbackType
  ) => {
    if (parentIndex === -1) {
      if (feedbackLocation)
        setFeedback({
          ...feedback,
          pipelineFeedback: {
            commonFeedback: feedback.pipelineFeedback.commonFeedback.map(
              (data, i) => {
                if (i === index) {
                  return { ...data, [feedbackType]: value };
                } else {
                  return data;
                }
              }
            ),
          },
        });
    } else {
      if (feedbackLocation === "granular") {
        setFeedback({
          ...feedback,
          taskFeedback: feedback.taskFeedback.map((data, i) => {
            if (i === parentIndex) {
              return {
                ...data,
                granularFeedback: data.granularFeedback.map((data, j) => {
                  if (j === index) {
                    return { ...data, [feedbackType]: value };
                  } else {
                    return data;
                  }
                }),
              };
            } else {
              return data;
            }
          }),
        });
      } else if (feedbackLocation === "common") {
        setFeedback({
          ...feedback,
          taskFeedback: feedback.taskFeedback.map((data, i) => {
            if (i === parentIndex) {
              return {
                ...data,
                commonFeedback: data.commonFeedback.map((data, j) => {
                  if (j === index) {
                    return { ...data, [feedbackType]: value };
                  } else {
                    return data;
                  }
                }),
              };
            } else {
              return data;
            }
          }),
        });
      }
    }
  };

  const renderFeedbackType = (
    feedbackType: FeedbackType,
    index,
    feedbackLocation,
    parentIndex = -1,
    data
  ) => {
    switch (feedbackType) {
      case FeedbackType.RATING:
        let value = data.rating;
        return (
          <Box mt="1%">
            <Text>How would you rate the overall quality of the output?</Text>
            {Array(5)
              .fill("")
              .map((_, i) => (
                <StarIcon
                  key={i}
                  mt="1%"
                  color={i < value ? "orange.500" : "gray.300"}
                  boxSize={6}
                  onClick={() =>
                    changeFeedbackState(
                      index,
                      i + 1,
                      feedbackLocation,
                      parentIndex,
                      feedbackType
                    )
                  }
                />
              ))}
          </Box>
        );
      case FeedbackType.COMMENT:
        let comment = data.comment;
        return (
          <Box mt="1%">
            <Text>How would you rate the overall quality of the output?</Text>
            <Textarea
              placeholder="Enter your comment here"
              value={comment}
              onChange={(e) =>
                changeFeedbackState(
                  index,
                  e.target.value,
                  feedbackLocation,
                  parentIndex,
                  feedbackType
                )
              }
            />
          </Box>
        );
      case FeedbackType.THUMBS:
        let thumbs = data.thumbs;

        console.log(thumbs);
        return (
          <Box mt="1%">
            <Text>How would you rate the overall quality of the output?</Text>
            <HStack>
              <Button
                variant={thumbs === false ? "ghost" : "solid"}
                onClick={() => {
                  changeFeedbackState(
                    index,
                    true,
                    feedbackLocation,
                    parentIndex,
                    feedbackType
                  );
                }}
              >
                👍
              </Button>
              <Button
                variant={thumbs === true ? "ghost" : "solid"}
                onClick={() => {
                  changeFeedbackState(
                    index,
                    false,
                    feedbackLocation,
                    parentIndex,
                    feedbackType
                  );
                }}
              >
                👎
              </Button>
            </HStack>
          </Box>
        );
      case FeedbackType.CHECKBOX_LIST:
        let checkboxList = data.checkboxList;
        return (
          <Box mt="1%">
            <Text>Which parameters should be improved?</Text>
            <CheckboxGroup>
              <HStack>
                {checkboxList.map((data, i) => {
                  return (
                    <Checkbox
                      key={i}
                      isChecked={data.isSelected}
                      onChange={(e) =>
                        changeFeedbackState(
                          index,
                          [...checkboxList].map((checkboxData, j) => {
                            if (j === i) {
                              return {
                                ...checkboxData,

                                isSelected: e.target.checked,
                              };
                            } else {
                              return checkboxData;
                            }
                          }),
                          feedbackLocation,
                          parentIndex,
                          feedbackType
                        )
                      }
                    >
                      {data.parameterName}
                    </Checkbox>
                  );
                })}
              </HStack>
            </CheckboxGroup>
          </Box>
        );
      case FeedbackType.THUMBS_LIST:
        let thumbsList = data.thumbsList;
        return (
          <Box mt="1%">
            <Text>Which parameters should be improved?</Text>
            <HStack>
              {thumbsList.map((data, i) => {
                return (
                  <Button
                    key={i}
                    variant={data.thumbs === true ? "solid" : "ghost"}
                    onClick={() =>
                      changeFeedbackState(
                        index,
                        [...thumbsList].map((thumbsData, j) => {
                          if (j === i) {
                            return {
                              ...thumbsData,
                              thumbs: !thumbsData.thumbs,
                            };
                          } else {
                            return thumbsData;
                          }
                        }),
                        feedbackLocation,
                        parentIndex,
                        feedbackType
                      )
                    }
                  >
                    {data.parameterName}
                  </Button>
                );
              })}
            </HStack>
          </Box>
        );
      case FeedbackType.RATING_LIST:
        let ratingList = data.ratingList;
        return (
          <Box mt="1%">
            <Text>Which parameters should be improved?</Text>
            <VStack alignItems={"flex-start"}>
              {ratingList.map((data, i) => {
                return (
                  <HStack key={i}>
                    <Text>{data.parameterName}</Text>
                    <Box>
                      {Array(5)
                        .fill("")
                        .map((_, k) => (
                          <StarIcon
                            key={k}
                            mt="1%"
                            color={k < data.rating ? "orange.500" : "gray.300"}
                            boxSize={6}
                            onClick={() =>
                              changeFeedbackState(
                                index,
                                [...ratingList].map((ratingData, j) => {
                                  if (j === i) {
                                    return {
                                      ...ratingData,
                                      rating: k + 1,
                                    };
                                  } else {
                                    return ratingData;
                                  }
                                }),
                                feedbackLocation,
                                parentIndex,
                                feedbackType
                              )
                            }
                          />
                        ))}
                    </Box>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        );
      default:
        return <></>;
    }
  };

  const onSubmitFeedback = async () => {
    let feedbackRequest: ULCAFeedbackRequest = {
      ...feedback,
      pipelineInput: pipelineInput,
      pipelineOutput: pipelineOutput,
      suggestedPipelineOutput: suggestedPipelineOutput,
      feedbackTimeStamp: Math.floor(Date.now() / 1000),
      feedbackLanguage: "en",
    };
    try {
      await submitFeedback(feedbackRequest);
    } catch {
      toast({
        title: "Error",
        description: "Error in submitting feedback",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <FormControl>
        {feedback.pipelineFeedback.commonFeedback?.map((data, index) => {
          return (
            <Box key={index}>
              {renderFeedbackType(
                data.feedbackType,
                index,
                "pipeline",
                -1,
                data
              )}
            </Box>
          );
        })}
      </FormControl>
      <FormControl>
        {feedback.taskFeedback.map((data, parentIndex) => {
          return (
            <Box key={parentIndex}>
              <Text fontSize="md" fontWeight="bold">
                {data.taskType}
              </Text>
              <Box>
                {data.commonFeedback?.map((data, index) => {
                  return (
                    <Box key={index}>
                      {renderFeedbackType(
                        data.feedbackType,
                        index,
                        "common",
                        parentIndex,
                        data
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Box>
                {data.granularFeedback?.map((data, index) => {
                  return (
                    <Box key={index}>
                      {renderFeedbackType(
                        data.feedbackType,
                        index,
                        "granular",
                        parentIndex,
                        data
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </FormControl>
      {suggestedPipelineOutput.pipelineResponse.filter((data, index) => {
        if (
          data.taskType === ULCATaskType.TRANSLATION ||
          data.taskType === ULCATaskType.TRANSLITERATION ||
          data.taskType === ULCATaskType.ASR
        ) {
          return data;
        }
      }).length !== 0 && (
        <>
          <Divider my="2%" />
          <FormControl>
            <FormLabel>
              <HStack>
                <Text fontSize="lg" fontWeight="bold">
                  Do you want to suggest the pipeline output?
                </Text>
                <Spacer />
                <Switch
                  onChange={() => setSuggest(!suggest)}
                  isChecked={suggest}
                />
              </HStack>
            </FormLabel>
            <Box>
              {suggest &&
                suggestedPipelineOutput?.pipelineResponse?.map(
                  (data, index) => {
                    if (
                      data.taskType === ULCATaskType.TRANSLATION ||
                      data.taskType === ULCATaskType.TRANSLITERATION ||
                      data.taskType === ULCATaskType.ASR
                    ) {
                      return (
                        <Box key={index}>
                          <Text fontSize="md" fontWeight="bold">
                            {data.taskType.toUpperCase()}
                          </Text>
                          {data.output.map((output, i) => {
                            return (
                              <Box key={i}>
                                <Input
                                  fontSize="md"
                                  fontWeight="bold"
                                  value={
                                    output.target
                                      ? output.target
                                      : output.source
                                  }
                                  onChange={(e) => {
                                    let newSuggestedPipelineOutput = {
                                      ...suggestedPipelineOutput,
                                    };
                                    if (newSuggestedPipelineOutput) {
                                      // @ts-ignore
                                      newSuggestedPipelineOutput.pipelineResponse[
                                        index
                                      ].output[i].target = e.target.value;
                                      setSuggestedPipelineOutput(
                                        newSuggestedPipelineOutput
                                      );
                                    }
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    }
                  }
                )}
            </Box>
          </FormControl>
        </>
      )}
      <Button mt={"2rem"} type="submit" onClick={onSubmitFeedback}>
        Submit
      </Button>
    </>
  );
};

export const FeedbackModal = (props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <Button
        variant={"outline"}
        onClick={onOpen}
        w="100%"
        _hover={{
          backgroundColor(theme) {
            return "orange.200";
          },
        }}
      >
        Give us feedback!
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Give us feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Feedback {...props} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
