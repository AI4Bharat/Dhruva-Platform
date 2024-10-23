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
import { taskOptions, languageOptions } from "../../components/Utils/Options";
import useMediaQuery from "../../hooks/useMediaQuery";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useState, useEffect } from "react";
import Head from "next/head";
import { listModels } from "../../api/modelAPI";
import { useQuery } from "@tanstack/react-query";
import ModelsTable from "../../components/Models/ModelsTable";
import NotFound from "../../components/Utils/NotFound";
import ModelsList from "../../components/Mobile/Models/ModelsList";

export default function Models() {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: listModels,
  });

  const [hide, toggleHide] = useState<boolean>(true);
  const [sourceLang, setSourceLanguage] = useState<string>("");
  const [targetLang, setTargetLanguage] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [hideTarget, setHideTarget] = useState<boolean>(true);
  const smallScreen = useMediaQuery("(max-width: 1080px)");
  const [filteredModels, setFilteredModels] = useState<ModelList[]>(models);
  const [searchedModels, setSearchedModels] = useState<ModelList[]>([]);
  const [seed, setSeed] = useState<number>(0);

  // Clear all filters
  const clearFilters = () => {
    setTask("");
    setSeed(Math.random());
    setSourceLanguage("");
    setTargetLanguage("");
    setFilteredModels(models);
    setSearchedModels(models);
  };

  // Search functionality
  const searchToggler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchedModels(
      filteredModels.filter((model) => model.name.toLowerCase().includes(query))
    );
  };

  // Filtering models based on selected options
  const filterToggler = () => {
    if (task !== "" || sourceLang !== "" || targetLang !== "") {
      setFilteredModels(
        models.filter((model) => {
          let found = false;

          // Check language filters
          const hasSourceLang = model.languages.some(
            (language) => language.sourceLanguage === sourceLang
          );
          const hasTargetLang = model.languages.some(
            (language) => language.targetLanguage === targetLang
          );

          if (sourceLang && targetLang) {
            found = hasSourceLang && hasTargetLang;
          } else if (sourceLang) {
            found = hasSourceLang;
          } else if (targetLang) {
            found = hasTargetLang;
          }

          // Check task type
          return found && model.task.type.includes(task);
        })
      );
    } else {
      setFilteredModels(models); // Reset to all models if no filters
    }
  };

  // Handlers for select inputs
  const sourceLangToggler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceLanguage(event.target.value);
  };

  const targetLangToggler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetLanguage(event.target.value);
  };

  const taskToggler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTask(event.target.value);
  };

  // Effects for filtering and state management
  useEffect(() => {
    filterToggler();
    setHideTarget(task === "translation" ? false : true);
    if (task !== "translation") {
      setTargetLanguage(""); // Reset target language if not translation
    }
  }, [sourceLang, targetLang, task, models]);

  useEffect(() => {
    setSearchedModels(filteredModels);
  }, [filteredModels]);

  useEffect(() => {
    if (models) {
      setFilteredModels(models);
      setSearchedModels(models);
      toggleHide(false);
    }
  }, [models]);

  return (
    <>
      <Head>
        <title>Models Registry</title>
      </Head>
      <ContentLayout>
        <Box bg="light.100" ml={smallScreen ? "1rem" : "0rem"} key={seed}>
          {/* Searchbar */}
          <Stack
            background={"gray.50"}
            direction={["column", "column", "column", "column", "row"]}
          >
            <InputGroup
              width={smallScreen ? "90vw" : "30rem"}
              background={"white"}
            >
              <InputLeftElement color="gray.600" pointerEvents="none">
                <IoSearchOutline />
              </InputLeftElement>
              <Input
                borderRadius={0}
                onChange={searchToggler}
                placeholder="Search for Models"
              />
            </InputGroup>
            <Select
              value={task}
              width={smallScreen ? "90vw" : "20rem"}
              background={"white"}
              borderRadius={0}
              color="gray.600"
              onChange={taskToggler}
            >
              <option hidden>Select Task Type</option>
              {taskOptions}
            </Select>
            <InputGroup
              width={smallScreen ? "90vw" : "30rem"}
              background={"white"}
            >
              <Select
                background={"white"}
                borderRadius={0}
                color="gray.600"
                onChange={sourceLangToggler}
              >
                <option hidden>Select Source Language</option>
                {languageOptions}
              </Select>
              <Select
                background={"white"}
                borderRadius={0}
                display={hideTarget ? "none" : "block"}
                onChange={targetLangToggler}
                color="gray.600"
              >
                <option hidden>Select Target Language</option>
                {languageOptions}
              </Select>
            </InputGroup>
            <Button
              width={smallScreen ? "90vw" : "8rem"}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Stack>
        </Box>
        <br />
        {isLoading ? (
          <p>Loading models...</p>
        ) : searchedModels.length > 0 ? (
          smallScreen ? (
            <ModelsList data={searchedModels} />
          ) : (
            <ModelsTable data={searchedModels} />
          )
        ) : (
          <NotFound hide={hide} />
        )}
      </ContentLayout>
    </>
  );
}
