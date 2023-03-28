import {
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Box,
  Button,
  Select,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import React, {useState } from "react";
import { submitFeedback } from "../../api/serviceAPI";
import { lang2label } from "../../config/config";

import Rating from "./Rating";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

interface IFeedback
{
  language: string,
  example: string,
  rating: number,
  comments: string,
  service_id: string
}

const Feedback = (props) => {

  const mutation = useMutation(submitFeedback);

  const [comment, setComment] = useState("");
  const handleCommentChange = (e) => setComment(e.target.value);

  const [language, setLanguage] = useState("");
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const [example, setExample] = useState("");
  const handleExampleChange = (e) => setExample(e.target.value);

  const [rating, setRating] = useState(0);
  const handleRatingChange = (newRating) => setRating(newRating);


  const [modal, setModal] = useState(<></>);
  const handleSubmitFeedback = () => {
    if (comment == "" || language == "") {
      setModal(
        <Box
          mt="1rem"
          width={"100%"}
          minH={"3rem"}
          border={"1px"}
          borderColor={"gray.300"}
          background={"red.50"}
        >
          <Text ml="1rem" mr="1rem" mt="0.5rem" color={"red.600"}>
            Fill all the required fields
          </Text>
        </Box>
      );
    } else {
      let request : IFeedback = {language:language, rating:rating, example:example, comments:comment, service_id:props.serviceID}
      mutation.mutate(request, {
        onSuccess: (data) => {
          setModal(
            <Box
              mt="1rem"
              width={"100%"}
              minH={"3rem"}
              border={"1px"}
              borderColor={"gray.300"}
              background={"green.50"}
            >
              <Text ml="1rem" mr="1rem" mt="0.5rem" color={"green.600"}>
                Submitted Successfully
              </Text>
            </Box>
          );
        },
        onError: (data) => {
          setModal(
            <Box
              mt="1rem"
              width={"100%"}
              minH={"3rem"}
              border={"1px"}
              borderColor={"gray.300"}
              background={"red.50"}
            >
              <Text ml="1rem" mr="1rem" mt="0.5rem" color={"red.600"}>
                {"ERROR"}
              </Text>
            </Box>
          );
        },
      });
    }
  };

  return (
    <>
      <FormLabel>Service ID</FormLabel>
      <Box
        width={"100%"}
        minH={"3rem"}
        border={"1px"}
        borderColor={"gray.300"}
        background={"blackAlpha.50"}
      >
        <Text ml="1rem" mr="1rem" mt="0.5rem" color={"gray.600"}>
          {props.serviceID}
        </Text>
      </Box>
      <FormControl isRequired >
      <FormLabel mt="1rem">Language</FormLabel>
      <Select onChange={handleLanguageChange} borderRadius={0} value={language}>
        <option hidden defaultChecked>Select Language</option>
        {props.serviceLanguages.map((languageConfig: LanguageConfig) => {
          return (
            <option
              key={JSON.stringify(languageConfig)}
              value={JSON.stringify(languageConfig)}
            >
              <Text>
              {lang2label[languageConfig.sourceLanguage]}
              {lang2label[languageConfig.targetLanguage]?" -> ":""}
              {lang2label[languageConfig.targetLanguage]}
              </Text>
            </option>
          );
        })}
      </Select>
      </FormControl>
      <FormControl isRequired mt="1rem">
        <FormLabel>Comments</FormLabel>
        <Textarea
          borderRadius={"0"}
          focusBorderColor={"orange.200"}
          value={comment}
          onChange={handleCommentChange}
        />
      </FormControl>
      <FormLabel mt="1rem">Example</FormLabel>
      <Textarea
        borderRadius={"0"}
        focusBorderColor={"orange.200"}
        value={example}
        onChange={handleExampleChange}
      />
      <FormControl isRequired mt="1rem">
        <FormLabel mt="1rem">Rating</FormLabel>
        <Rating onChange={handleRatingChange} />
      </FormControl>
      <Button mt={"2rem"} type="submit" onClick={handleSubmitFeedback}>
        Submit
      </Button>
      {modal}
    </>
  );
};

export default Feedback;
