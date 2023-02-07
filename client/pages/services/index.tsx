import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Stack,
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
import ServiceCard from "../../components/Mobile/Services/ServiceCard";
import { dhruvaConfig } from "../../config/config";
import Image from "next/image";
import Head from "next/head";

interface Service {
  serviceId: string;
  name: string;
  serviceDescription: string;
  hardwareDescription: string;
  publishedOn: number;
  modelId: string;
  task: any;
  languages: any;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [sourceLang, setSourceLanguage] = useState<string>("");
  const [targetLang, setTargetLanguage] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [filteredservices, setFilteredServices] = useState<Service[]>([]);
  const [searchedservices, setSearchedServices] = useState<Service[]>([]);
  const [hide, togglehide] = useState<boolean>(true);
  const [hideTarget, setHideTarget] = useState<boolean>(true);
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [seed, setSeed] = useState<number>(0);

  const clearFilters = () => {
    setTask("");
    setSeed(Math.random());
    setSourceLanguage("");
    setTargetLanguage("");
    setFilteredServices(services);
    setSearchedServices(services);
  };

  const searchToggler = (event: any) => {
    setSearchedServices(
      filteredservices.filter((service) =>
        service.name.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  const filterToggler = () => {
    if (task !== "" || sourceLang !== "" || targetLang !== "")
      setFilteredServices(
        services.filter((service) => {
          let found = false;
          if (targetLang === "" && sourceLang !== "") {
            service.languages.every(
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
            service.languages.every(
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
            service.languages.every(
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
            return service.task.type.includes(task);
          }
          return found && service.task.type.includes(task);
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
    setTask(event.target.value);
  };

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listServices,
    }).then((response) => {
      setServices(response.data);
      setFilteredServices(response.data);
      setSearchedServices(response.data);
      togglehide(false);
    });
  }, []);

  useEffect(() => {
    filterToggler();
  }, [sourceLang, targetLang, task]);

  useEffect(() => {
    setSearchedServices(filteredservices);
  }, [filteredservices]);

  return (
    <>
      <Head>
        <title>Services</title>
      </Head>
      <ContentLayout>
        <Box bg="light.100" ml={smallscreen ? "1rem" : "0rem"} key={seed}>
          {/* Searchbar */}
          {smallscreen ? (
            <VStack width={"90vw"} background={"gray.50"}>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <InputLeftElement
                  color="gray.300"
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
                value={task}
                width={smallscreen ? "90vw" : "20rem"}
                background={"white"}
                borderRadius={0}
                color="gray.300"
                onChange={taskToggler}
              >
                <option hidden defaultChecked>
                  Select Task Type
                </option>
                <option
                  onClick={() => {
                    setHideTarget(false);
                  }}
                  value="translation"
                >
                  Translation
                </option>
                <option
                  onClick={() => {
                    setHideTarget(true);
                    setTargetLanguage("");
                  }}
                  value="tts"
                >
                  TTS
                </option>
                <option
                  onClick={() => {
                    setHideTarget(true);
                    setTargetLanguage("");
                  }}
                  value="asr"
                >
                  ASR
                </option>
              </Select>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <Select
                  value={sourceLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.300"
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
                  value={targetLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.300"
                  onChange={targetLangToggler}
                  display={hideTarget ? "none" : "block"}
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
            </VStack>
          ) : (
            <HStack background={"gray.50"}>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <InputLeftElement
                  color="gray.300"
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
                value={task}
                width={smallscreen ? "90vw" : "20rem"}
                background={"white"}
                borderRadius={0}
                color="gray.300"
                onChange={taskToggler}
              >
                <option hidden defaultChecked>
                  Select Task Type
                </option>
                <option
                  onClick={() => {
                    setHideTarget(false);
                  }}
                  value="translation"
                >
                  Translation
                </option>
                <option
                  onClick={() => {
                    setHideTarget(true);
                    setTargetLanguage("");
                  }}
                  value="tts"
                >
                  TTS
                </option>
                <option
                  onClick={() => {
                    setHideTarget(true);
                    setTargetLanguage("");
                  }}
                  value="asr"
                >
                  ASR
                </option>
              </Select>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <Select
                  value={sourceLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.300"
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
                  value={targetLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.300"
                  onChange={targetLangToggler}
                  display={hideTarget ? "none" : "block"}
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
            </HStack>
          )}
        </Box>
        <br />
        {smallscreen ? (
          // Mobile View
          searchedservices.length > 0 ? (
            <>
              {Object.entries(searchedservices).map(([id, serviceData]) => (
                <ServiceCard
                  key={id}
                  name={serviceData.name}
                  serviceID={serviceData.serviceId}
                  modelID={serviceData.modelId}
                  date={new Date(serviceData.publishedOn).toDateString()}
                />
              ))}
            </>
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
            {searchedservices.length > 0 ? (
              <Table variant="unstyled">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Service ID</Th>
                    <Th>Model ID</Th>
                    <Th>Published On</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(searchedservices).map(([id, serviceData]) => {
                    const publishedOn = new Date(serviceData.publishedOn);
                    return (
                      <Tr key={id} fontSize={"sm"}>
                        <Td>{serviceData.name}</Td>
                        <Td>{serviceData.serviceId}</Td>
                        <Td>{serviceData.modelId}</Td>
                        <Td>{publishedOn.toDateString()}</Td>
                        <Td>
                          {" "}
                          <Link
                            href={{
                              pathname: `/services/view`,
                              query: {
                                serviceId: serviceData.serviceId,
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
