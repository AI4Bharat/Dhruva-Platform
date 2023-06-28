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
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  TabList,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
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
  // STS = "sts", // TODO: Remove
}
enum FeedbackType {
  RATING = "rating",
  COMMENT = "comment",
  THUMBS = "thumbs",
  RATING_LIST = "rating-list",
  COMMENT_LIST = "comment-list",
  THUMBS_LIST = "thumbs-list",
  CHECKBOX_LIST = "checkbox-list",
}

interface FeedbackProps {
  feedbackLanguage: string;
  pipelineInput: PipelineInput;
  pipelineOutput: PipelineOutput;
  taskType?: ULCATaskType | ULCATaskType[];
}

const Feedback: React.FC<FeedbackProps> = ({
  feedbackLanguage,
  pipelineInput,
  pipelineOutput,
  taskType,
}) => {
  const [feedback, setFeedback] = useState<any>();
  const [suggest, setSuggest] = useState(false);
  const [suggestedPipelineOutput, setSuggestedPipelineOutput] =
    useState<PipelineOutput>(pipelineOutput);
  const toast = useToast();
  const fetchQuestions = async () => {
    let response = await fetchFeedbackQuestions({
      feedbackLanguage: feedbackLanguage,
      supportedTasks: [taskType],
    });
    response.pipelineFeedback.commonFeedback = getFeedbackType(
      response.pipelineFeedback.commonFeedback
    );
    let temp = response.taskFeedback.map((data) => {
      return {
        ...data,
        commonFeedback: getFeedbackType(data.commonFeedback),
        granularFeedback: getFeedbackType(data.granularFeedback),
      };
    });
    //@ts-ignore
    response.taskFeedback = temp;
    console.log(response);
    //TODO: Write parsing function for state management
    setFeedback(response);
  };

  const getFeedbackTypeString = (feedbackType: string) => {
    if (feedbackType.includes("-") === false) {
      return feedbackType;
    }

    return (
      feedbackType.split("-")[0] +
      feedbackType.split("-")[1][0].toUpperCase() +
      feedbackType.split("-")[1].slice(1)
    );
  };
  const getFeedbackType = (
    feedbackList: {
      question: string;
      supportedFeedbackTypes: string[];
      parameters?: string[];
    }[]
  ) => {
    let temp = feedbackList.map((data) => {
      if (data.supportedFeedbackTypes.includes(FeedbackType.RATING)) {
        return {
          ...data,
          feedbackType: FeedbackType.RATING,
          rating: 0,
        };
      } else if (data.supportedFeedbackTypes.includes(FeedbackType.THUMBS)) {
        return {
          ...data,
          feedbackType: FeedbackType.THUMBS,
          thumbs: false,
        };
      } else if (data.supportedFeedbackTypes.includes(FeedbackType.COMMENT)) {
        return {
          ...data,
          feedbackType: FeedbackType.COMMENT,
          comment: "",
        };
      } else if (
        data.supportedFeedbackTypes.includes(FeedbackType.CHECKBOX_LIST)
      ) {
        return {
          ...data,
          feedbackType: FeedbackType.CHECKBOX_LIST,
          checkboxList: data.parameters.map((d) => {
            return {
              parameterName: d,
              isSelected: false,
            };
          }),
        };
      } else if (
        data.supportedFeedbackTypes.includes(FeedbackType.THUMBS_LIST)
      ) {
        return {
          ...data,
          feedbackType: FeedbackType.THUMBS_LIST,
          thumbsList: data.parameters.map((d) => {
            return {
              parameterName: d,
              thumbs: false,
            };
          }),
        };
      } else if (
        data.supportedFeedbackTypes.includes(FeedbackType.RATING_LIST)
      ) {
        return {
          ...data,
          feedbackType: FeedbackType.RATING_LIST,
          ratingList: data.parameters.map((d) => {
            return {
              parameterName: d,
              rating: 0,
            };
          }),
        };
      }
    });
    return temp;
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
                  return {
                    ...data,
                    [getFeedbackTypeString(feedbackType)]: value,
                  };
                } else {
                  return data;
                }
              }
            ),
          },
        });
    } else {
      if (feedbackLocation === "granular") {
        console.log(parentIndex, index, value, feedbackType);
        setFeedback({
          ...feedback,
          taskFeedback: feedback.taskFeedback.map((data, i) => {
            if (i === parentIndex) {
              return {
                ...data,
                granularFeedback: data.granularFeedback.map((data, j) => {
                  if (j === index) {
                    return {
                      ...data,
                      [getFeedbackTypeString(feedbackType)]: value,
                    };
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
                    return {
                      ...data,
                      [getFeedbackTypeString(feedbackType)]: value,
                    };
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
            <Text>{data.question}</Text>
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
            <Text>{data.question}</Text>
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
            <Text>{data.question}</Text>
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
            <Text>{data.question}</Text>
            <CheckboxGroup>
              <HStack>
                {checkboxList.map((data, i) => {
                  return (
                    <Checkbox
                      key={i}
                      isChecked={data.isSelected}
                      onChange={(e) => {
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
                        );
                      }}
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
            <Text>{data.question}</Text>
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
            <Text>{data.question}</Text>
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

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <>
      {feedback && (
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
            <Tabs>
              <TabList>
                {feedback.taskFeedback.map((data, parentIndex) => {
                  return <Tab>{data.taskType}</Tab>;
                })}
              </TabList>
              <TabPanels>
                {feedback.taskFeedback.map((data, parentIndex) => {
                  return (
                    <TabPanel key={parentIndex}>
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
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          </FormControl>
        </>
      )}
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
                                  // @ts-ignore
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
