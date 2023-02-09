import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import useMediaQuery from "../../hooks/useMediaQuery";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import ModelCard from "../../components/Mobile/Models/ModelCard";
import { dhruvaConfig } from "../../config/config";
import Image from "next/image";
import Head from "next/head";

interface Model {
  name: string;
  version: string;
  modelId: string;
  task: any;
  languages: any;
}
export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [hide, togglehide] = useState<boolean>(true)
  const [sourceLang, setSourceLanguage] = useState<String>("");
  const [targetLang, setTargetLanguage] = useState<String>("");
  const [task, setTask] = useState<String>("");
  const [hideTarget, setHideTarget] = useState<boolean>(true);
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [filteredModels, setFilteredModels] = useState<Model[]>(models);
  const [searchedModels, setSearchedModels] = useState<Model[]>([]);
  const [seed, setSeed] = useState<number>(0);

  const clearFilters = () => {
    setTask("");
    setSeed(Math.random());
    setSourceLanguage("");
    setTargetLanguage("");
    setFilteredModels(models);
    setSearchedModels(models);
  };

  const searchToggler = (event: any) => {
    setSearchedModels(
      filteredModels.filter((model) =>
        model.name.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  const filterToggler = () => {
    if (task !== "" || sourceLang !== "" || targetLang !== "")
      setFilteredModels(
        models.filter((model) => {
          let found = false;
          if (targetLang === "" && sourceLang !== "") {
            model.languages.every(
              (language: {
                sourceLanguage: string;
                targetLanguage: string;
              }) => {
                if (language.sourceLanguage === sourceLang) {
                  found = true;
                  return false;
                }
                return true;
              }
            );
          } else if (sourceLang === "" && targetLang !== "") {
            model.languages.every(
              (language: {
                sourceLanguage: string;
                targetLanguage: string;
              }) => {
                if (language.targetLanguage === targetLang) {
                  found = true;
                  return false;
                }
                return true;
              }
            );
          } else if (targetLang !== "" && sourceLang !== "") {
            model.languages.every(
              (language: {
                sourceLanguage: string;
                targetLanguage: string;
              }) => {
                if (
                  language.targetLanguage === targetLang &&
                  language.sourceLanguage === sourceLang
                ) {
                  found = true;
                  return false;
                }
                return true;
              }
            );
          } else if (targetLang === "" && sourceLang === "" && task !== "") {
            return model.task.type.includes(task);
          }
          return found && model.task.type.includes(task);
        })
      );
  };

  const sourceLangToggler = (event: any) => {
    setSourceLanguage(event.target.value);
  };

  const targetLangToggler = (event: any) => {
    setTargetLanguage(event.target.value);
  };

  const taskToggler = (event: any) => {
    if (event.target.value === "translation") setHideTarget(false);
    else {
      setHideTarget(true);
      setTargetLanguage("")
    }
    setTask(event.target.value);
  };

  useEffect(() => {
    filterToggler();
  }, [sourceLang, targetLang, task]);

  useEffect(() => {
    setSearchedModels(filteredModels);
  }, [filteredModels]);

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listModels,
    }).then((response) => {
      setModels(response.data);
      setFilteredModels(response.data);
      setSearchedModels(response.data);
      togglehide(false);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Models Registry</title>
      </Head>
      <ContentLayout>
        <Box bg="light.100" ml={smallscreen ? "1rem" : "0rem"} key={seed}>
          {/* Searchbar */}
          {smallscreen ?
            <VStack
              width="90vw"
              background={"gray.50"}
            >
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <InputLeftElement
                  color="gray.600"
                  pointerEvents="none"
                  children={<IoSearchOutline />}
                />
                <Input
                  borderRadius={0}
                  onChange={searchToggler}
                  placeholder="Search for Services"
                />
              </InputGroup>
              <Select
                width={smallscreen ? "90vw" : "20rem"}
                background={"white"}
                borderRadius={0}
                color="gray.600"
                onChange={taskToggler}
              >
                <option defaultChecked hidden>
                  Select Task Type
                </option>
                <option value="translation">Translation</option>
                <option value="tts">TTS</option>
                <option value="asr">ASR</option>
              </Select>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <Select
                  background={"white"}
                  borderRadius={0}
                  color="gray.600"
                  onChange={sourceLangToggler}
                >
                  <option hidden defaultChecked>
                    Source Language
                  </option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="as">Assamese</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="mr">Marathi</option>
                  <option value="or">Oriya</option>
                  <option value="pa">Punjabi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </Select>
                {hideTarget ? (<></>) : (<Select
                  background={"white"}
                  borderRadius={0}
                  onChange={targetLangToggler}
                  color="gray.600"
                >
                  <option hidden defaultChecked>
                    Target Language
                  </option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="as">Assamese</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="mr">Marathi</option>
                  <option value="or">Oriya</option>
                  <option value="pa">Punjabi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </Select>)}
              </InputGroup>
              <Button
                width={smallscreen ? "90vw" : "8rem"}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </VStack> :
            <HStack
              background={"gray.50"}
            >
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <InputLeftElement
                  color="gray.600"
                  pointerEvents="none"
                  children={<IoSearchOutline />}
                />
                <Input
                  borderRadius={0}
                  onChange={searchToggler}
                  placeholder="Search for Services"
                />
              </InputGroup>
              <Select
                width={smallscreen ? "90vw" : "20rem"}
                background={"white"}
                borderRadius={0}
                color="gray.600"
                onChange={taskToggler}
              >
                <option defaultChecked hidden>
                  Select Task Type
                </option>
                <option onClick={() => { setHideTarget(false) }} value="translation">Translation</option>
                <option onClick={() => { setHideTarget(true); setTargetLanguage("") }} value="tts">TTS</option>
                <option onClick={() => { setHideTarget(true); setTargetLanguage("") }} value="asr">ASR</option>
              </Select>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <Select
                  background={"white"}
                  borderRadius={0}
                  color="gray.600"
                  onChange={sourceLangToggler}
                >
                  <option hidden defaultChecked>
                    Source Language
                  </option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="as">Assamese</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="mr">Marathi</option>
                  <option value="or">Oriya</option>
                  <option value="pa">Punjabi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </Select>
                <Select
                  background={"white"}
                  borderRadius={0}
                  display={hideTarget ? "none" : "block"}
                  onChange={targetLangToggler}
                  color="gray.600"
                >
                  <option hidden defaultChecked>
                    Target Language
                  </option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="as">Assamese</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="mr">Marathi</option>
                  <option value="or">Oriya</option>
                  <option value="pa">Punjabi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </Select>
              </InputGroup>
              <Button
                width={smallscreen ? "90vw" : "8rem"}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </HStack>}

        </Box>
        <br />
        {smallscreen ? (
          // Mobile View
          searchedModels.length > 0 ? (
            <Box>
              {Object.entries(searchedModels).map(([id, modelData]) => (
                <ModelCard
                  key={id}
                  name={modelData.name}
                  modelId={modelData.modelId}
                  version={modelData.version}
                  taskType={modelData.task.type}
                />
              ))}
            </Box>
          ) : (
            <>
              <HStack background={"gray.50"} width="100vw" height="50vh">
                <Spacer />
                <Box textAlign={"center"} display={hide ? "none" : "block"}>
                  <Image
                    height={300}
                    width={300}
                    alt="No Results Found"
                    src="NoResults.svg"
                  />
                  <Text fontSize={"lg"} color="gray.400">
                    Uh Oh! No Results Found
                  </Text>
                </Box>
                <Spacer />
              </HStack>
            </>
          )
        ) : (
          // Desktop View
          <Box bg="light.100">
            {searchedModels.length > 0 ? (
              <Table variant="unstyled">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Model ID</Th>
                    <Th>Version</Th>
                    <Th>Task Type</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(searchedModels).map(([id, modelData]) => {
                    return (
                      <Tr key={id} fontSize={"sm"}>
                        <Td>{modelData.name}</Td>
                        <Td>{modelData.modelId}</Td>
                        <Td>{modelData.version}</Td>
                        <Td>{modelData.task.type}</Td>
                        <Td>
                          {" "}
                          <Link
                            href={{
                              pathname: `/models/view`,
                              query: {
                                modelId: modelData.modelId,
                              },
                            }}
                          >
                            {" "}
                            <Button size={"sm"} variant={"outline"}>
                              View
                            </Button>
                          </Link>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <HStack background={"gray.50"}>
                <Spacer />
                <Box textAlign={"center"} display={hide ? "none" : "block"}>
                  <Image
                    height={400}
                    width={400}
                    alt="No Results Found"
                    src="NoResults.svg"
                  />
                  <Text fontSize={"lg"} color="gray.400">
                    Uh Oh! No Results Found
                  </Text>
                </Box>
                <Spacer />
              </HStack>
            )}
          </Box>
        )}
      </ContentLayout>
    </>
  );
}
