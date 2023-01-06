import { Box, Button, Input, InputGroup, InputLeftElement, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import Link from "next/link";
import {IoSearchOutline} from "react-icons/io5"
import ContentLayout from "../../components/Layouts/ContentLayout";

export default function Services() {
    const services = [
        {
            serviceId:"1",
            name : "Demo Service 1",
            serviceType : "Type 1",
            modelType: "Type A"
        },
        {
            serviceId:"2",
            name : "Demo Service 2",
            serviceType : "Type 1",
            modelType: "Type A"
        },
        {
            serviceId:"3",
            name : "Demo Service 3",
            serviceType : "Type 1",
            modelType: "Type A"
        },
        {
            serviceId:"4",
            name : "Demo Service 4",
            serviceType : "Type 1",
            modelType: "Type A"
        },
    ]
    return (
      <>
        <ContentLayout>
            <Box width="30rem" bg="light.100">
            <InputGroup>
            <InputLeftElement
            color="gray.300"
            pointerEvents='none'
            children={<IoSearchOutline />}
            />
            <Input borderRadius={0} placeholder='Search for Services' />
            </InputGroup>
            </Box>
            <br/>
            <Box bg="light.100">
            <Table variant="unstyled">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Service Type</Th>
                        <Th>Model Type</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                {services?.map((service:any) => (   
                    <Tr fontSize={'sm'}>
                        <Td>{service.name}</Td>
                        <Td>{service.serviceType}</Td>
                        <Td>{service.modelType}</Td>
                        <Td> <Link href={`/services/${service.serviceId}`}> <Button size={'sm'} variant={'outline'}>View</Button></Link></Td>
                    </Tr>
                        ))}
                </Tbody>
            </Table>

            </Box>
        </ContentLayout>
      </>
    );
  }
  