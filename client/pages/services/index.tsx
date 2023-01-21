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
import ServiceCard from "../../components/Mobile/Services/ServiceCard";
import { dhruvaConfig } from "../../config/config";

interface Service {
  serviceId: string;
  name: string;
  serviceDescription: string;
  hardwareDescription: string;
  publishedOn: number;
  modelId: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listServices,
    }).then((response) => setServices(response.data));
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
            <Input borderRadius={0} placeholder="Search for Services" />
          </InputGroup>
        </Box>
        <br />
        {smallscreen ? (
          // Mobile View
          <>
            {Object.entries(services).map(([id, serviceData]) => (
              <ServiceCard
                name={serviceData.name}
                serviceID={serviceData.serviceId}
                modelID={serviceData.modelId}
                date={new Date(serviceData.publishedOn).toDateString()}
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
          </Box>
        )}
      </ContentLayout>
    </>
  );
}
