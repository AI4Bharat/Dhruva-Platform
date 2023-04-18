import { Box, Button, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import Link from 'next/link';
import React, { FunctionComponent } from 'react'

const ModelsTable: FunctionComponent<{data:ModelList[]}> = (props) => {

  const searchedModels : ModelList[] = props.data;
  return (
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
  </Box>
  )
}

export default ModelsTable