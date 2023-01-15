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
import ContentLayout from "../../components/Layouts/ContentLayout";
import { useState, useEffect } from "react";
import axios from "axios";

interface Service {
  name: string;
  serviceType: string;
  modelType: string;
  modelId: string;
  publishedOn: number;
}

interface Services {
  [key: string]: Service;
}

export default function Services() {
  const [services, setServices] = useState<Services>({});

  useEffect(() => {
    axios({
      method: "GET",
      url: "https://api.dhruva.co/services/list",
    }).then((response) => setServices(response.data));
  }, []);

  return (
    <>
      <ContentLayout>
        <Box width="30rem" bg="light.100">
          <InputGroup>
            <InputLeftElement
              color="gray.300"
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input borderRadius={0} placeholder="Search for Services" />
          </InputGroup>
        </Box>
        <br />
        <Box bg="light.100">
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
              {Object.entries(services).map(([id, serviceData]) => {
                const publishedOn = new Date(serviceData.publishedOn);
                return (
                  <Tr key={id} fontSize={"sm"}>
                    <Td>{serviceData.name}</Td>
                    <Td>{id}</Td>
                    <Td>{serviceData.modelId}</Td>
                    <Td>{publishedOn.toDateString()}</Td>
                    <Td>
                      {" "}
                      <Link
                        href={{
                          pathname: `/services/view`,
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
      </ContentLayout>
    </>
  );
}
