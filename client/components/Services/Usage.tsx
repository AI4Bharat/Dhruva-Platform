import { Box, Text, Table, Td, Th, Tr, Center, Thead } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { listallkeys } from '../../api/serviceAPI';

const Usage = (props) => {

    const { data: keylist} = useQuery(["keys", props.serviceID],() => listallkeys(props.serviceID));

  return (
    <>
    <Center background={"orange.50"}> <Text fontWeight={"bold"} fontSize={"2xl"}>Total Usage : {keylist?.total_usage}</Text> </Center>
    <Box maxH="500px" overflowY="auto">
        <Table variant={"unstyled"}>
        <Thead position="sticky" top="0" zIndex="sticky" bg="white">
          <Tr>
            <Th>API Key</Th>
            <Th>Usage</Th>
          </Tr>
        </Thead>
            {
                keylist?.api_keys?.map((key)=>
                {
                    return(
                    <Tr>
                    <Td>{key.name}</Td>
                    <Td>{key.usage}</Td>
                    </Tr>)
                })
            }
        </Table>
    </Box>
    </>
  )
}

export default Usage