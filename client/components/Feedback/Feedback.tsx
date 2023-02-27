import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Box,
  Button,
  Select,
} from "@chakra-ui/react";
import React, {useState } from "react";
import { lang2label } from "../../config/config";

import Rating from "./Rating";

interface LanguageConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

const Feedback = (props) => {

  const [comment, setComment] = useState("");
  const handleCommentChange = (e) => setComment(e.target.value);

  const [language, setLanguage] = useState();
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const [example, setExample] = useState("");
  const handleExampleChange = (e) => setExample(e.target.value);

  const [rating, setRating] = useState(0);
  const handleRatingChange = (newRating) => setRating(newRating);

  const [modal, setModal] = useState(<></>);
  const handleSubmitFeedback = () => {
    if (comment == "") {
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
      <FormLabel mt="1rem">Language</FormLabel>
      <Select onChange={handleLanguageChange} borderRadius={0} value={language}>
        {props.serviceLanguages.map((languageConfig: LanguageConfig) => {
          return (
            <option
              key={JSON.stringify(languageConfig)}
              value={JSON.stringify(languageConfig)}
            >
              {lang2label[languageConfig.sourceLanguage]}
              {lang2label[languageConfig.targetLanguage]?" - ":""}
              {lang2label[languageConfig.targetLanguage]}
            </option>
          );
        })}
      </Select>
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
