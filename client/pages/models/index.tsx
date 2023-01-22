import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
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
import Image from "next/image";

interface Model {
  name: string;
  version: string;
  modelId: string;
  task: any;
}
export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [hide, togglehide] = useState<boolean>(true)
  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const [filteredModels, setFilteredModels] = useState<Model[]>(models)

  const modelsToggler = (event:any) => 
  {
    setFilteredModels(
      models.filter((model) =>
        model.name
          .toLowerCase()
          .includes(event.target.value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listModels,
    }).then((response) => {setModels(response.data); setFilteredModels(response.data); togglehide(false)});
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
            <Input onChange={modelsToggler} borderRadius={0} placeholder="Search for Models" />
          </InputGroup>
        </Box>
        <br />
        {smallscreen ? ( 
          // Mobile View
          filteredModels.length > 0 ? 
          <Box>
            {Object.entries(filteredModels).map(([id, modelData]) => (
              <ModelCard
                name={modelData.name}
                modelID={modelData.modelId}
                version={modelData.version}
                taskType={modelData.task.type}
              />
            ))}
          </Box> : 
        <>                        
          <HStack background={"gray.50"} width="100vw" height="50vh">
            <Spacer/>
              <Box textAlign={"center"} display={hide?"none":"block"} >
              <Image height={300} width={300}  alt="No Results Found" src="NoResults.svg"/>
              <Text fontSize={"lg"} color="gray.400">Uh Oh! No Results Found</Text>
              </Box>
            <Spacer/>
          </HStack>
        </>
        ) : (
          // Desktop View
          <Box bg="light.100">
            {filteredModels.length > 0 ?            
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
                {Object.entries(filteredModels).map(([id, modelData]) => {
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
            </Table>:
            <HStack background={"gray.50"}>
              <Spacer/>
                <Box textAlign={"center"} display={hide?"none":"block"}>
                <Image height={400} width={400}  alt="No Results Found" src="NoResults.svg"/>
                <Text fontSize={"lg"} color="gray.400">Uh Oh! No Results Found</Text>
                </Box>
              <Spacer/>
            </HStack>}

          </Box>
        )}
      </ContentLayout>
    </>
  );
}
