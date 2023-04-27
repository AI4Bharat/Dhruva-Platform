import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
} from "@chakra-ui/react";
import { IoSearchOutline } from "react-icons/io5";
import useMediaQuery from "../../hooks/useMediaQuery";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { listServices } from "../../api/serviceAPI";
import {taskOptions, languageOptions} from "../../components/Utils/Options"
import ServicesTable from "../../components/Services/ServicesTable";
import ServicesList from "../../components/Mobile/Services/ServicesList";
import NotFound from "../../components/Utils/NotFound";

export default function Services() {
  const { data: services } = useQuery(["services"], listServices);
  const [sourceLang, setSourceLanguage] = useState<string>("");
  const [targetLang, setTargetLanguage] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [filteredservices, setFilteredServices] = useState<ServiceList[]>([]);
  const [searchedservices, setSearchedServices] = useState<ServiceList[]>([]);
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
    if (services) {
      setFilteredServices(services);
      setSearchedServices(services);
      togglehide(false);
    }
  }, [services]);

  useEffect(() => {
    filterToggler();
    if (task == "translation") {
      setHideTarget(false);
    } else {
      setHideTarget(true);
      setTargetLanguage("");
    }
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
          <Stack background={"gray.50"} direction={['column','column','column','column', 'row']}>
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
                  color="gray.600"
                  onChange={searchToggler}
                  placeholder="Search for Services"
                />
              </InputGroup>
              <Select
                value={task}
                width={smallscreen ? "90vw" : "20rem"}
                background={"white"}
                borderRadius={0}
                color="gray.600"
                onChange={taskToggler}
              >
                <option hidden defaultChecked>
                  Select Task Type
                </option>
                {taskOptions}
              </Select>
              <InputGroup
                width={smallscreen ? "90vw" : "30rem"}
                background={"white"}
              >
                <Select
                  value={sourceLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.600"
                  onChange={sourceLangToggler}
                >
                  <option hidden defaultChecked>
                    Source Language
                  </option>
                  {languageOptions}
                </Select>
                <Select
                  value={targetLang}
                  background={"white"}
                  borderRadius={0}
                  color="gray.600"
                  onChange={targetLangToggler}
                  display={hideTarget ? "none" : "block"}
                >
                  <option hidden defaultChecked>
                    Target Language
                  </option>
                  {languageOptions}
                </Select>
              </InputGroup>
              <Button
                width={smallscreen ? "90vw" : "8rem"}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
          </Stack>
        </Box>
        <br />
        {
          searchedservices?
          searchedservices.length!==0?
          smallscreen? <ServicesList data={searchedservices}/>:<ServicesTable data={searchedservices} />
          :<NotFound hide={hide}/>
          :<></>
        }
      </ContentLayout>
    </>
  );
}
