import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import useMediaQuery from "../../hooks/useMediaQuery";
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import ModelCard from "../../components/Mobile/Models/ModelCard";
import { dhruvaConfig } from "../../config/config";

interface Model {
  name: string;
  version: string;
  modelId: string;
  task: any;
}

interface Models {
  [key: string]: Model;
}

export default function Models() {
  const [models, setModels] = useState<Models>({});
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listModels,
    }).then((response) => setModels(response.data));
  }, []);

  return (
    <>
      <ContentLayout>
        <Box
          width={smallscreen ? "20rem" : "30rem"}
          bg="light.100"
          ml={smallscreen ? "1rem" : "0rem"}
        >
          {/* Searchbar */}
          <InputGroup>
            <InputLeftElement
              color="gray.300"
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input borderRadius={0} placeholder="Search for Models" />
          </InputGroup>
        </Box>
        <br />
        {smallscreen ? (
          // Mobile View
          <>
            {Object.entries(models).map(([id, modelData]) => (
              <ModelCard
                key={id}
                name={modelData.name}
                modelID={modelData.modelId}
                version={modelData.version}
                taskType={modelData.task.type}
              />
            ))}
          </>
        ) : (
          // Desktop View
          <Box bg="light.100">
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
                {Object.entries(models).map(([id, modelData]) => {
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
                            pathname: `/models`,
                            query: {
                              serviceId: id,
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
          </Box>
        )}
      </ContentLayout>
    </>
  );
}
