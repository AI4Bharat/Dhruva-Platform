import { Box, Button, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import Link from 'next/link';
import React, { FunctionComponent } from 'react'

const ServicesTable: FunctionComponent<{data:ServiceList[]}> = (props) => {

const searchedservices : ServiceList[] = props.data;
  return (
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
  </Box>
  )
}

export default ServicesTable