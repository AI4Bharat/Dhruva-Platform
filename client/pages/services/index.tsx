import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Stack,
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
import ServiceCard from "../../components/Mobile/Services/ServiceCard";
import { dhruvaConfig } from "../../config/config";
import Image from "next/image";

interface Service {
  serviceId: string;
  name: string;
  serviceDescription: string;
  hardwareDescription: string;
  publishedOn: number;
  modelId: string;
  task_type : any;
  languages : any;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [sourceLang, setSourceLanguage] = useState<String>("")
  const [targetLang, setTargetLanguage] = useState<String>("")
  const [filteredservices, setFilteredServices] = useState<Service[]>([]);
  const [hide, togglehide] = useState<boolean>(true)
  const smallscreen = useMediaQuery("(max-width: 1080px)");

  const servicesToggler = (event:any) => 
  {
    setFilteredServices(
      services.filter((service) =>
        service.name
          .toLowerCase()
          .includes(event.target.value.toLowerCase())
      )
    );
  };

  const taskToggler = (event:any) =>
  {
    setFilteredServices(
      services.filter((service) =>
        service.task_type.type
          .includes(event.target.value)
      )
    );
  }

  const langToggler = (src : String, target: String) =>
  {
    if(src="")
    {
      setFilteredServices(
        services.filter((service) =>
        service.languages.forEach((p:any)=>{
          p.targetLanguage.includes(target)
        })
        )
      );
    }
    if(target="")
    {
      setFilteredServices(
        services.filter((service) =>
        service.languages.some((p:any)=>{
          p.sourceLanguage.includes(src)
        })
        )
      );
    }
    else
    {
      setFilteredServices(
        services.filter((service) =>
        service.languages.some((p:any)=>{
          p.sourceLanguage.includes(src) &&
          p.targetLanguage.includes(target)
        })
        )
      );
    }
  }
  const sourceLangToggler = (event:any) =>
  {
    setSourceLanguage(event.target.value);
    langToggler(sourceLang,targetLang);
  } 

  const targetLangToggler = (event:any) =>
  {
    setTargetLanguage(event.target.value);
    langToggler(sourceLang,targetLang);
  }

  useEffect(() => {
    axios({
      method: "GET",
      url: dhruvaConfig.listServices,
    }).then((response) => {setServices(response.data); setFilteredServices(response.data); togglehide(false)});
  }, []);

  return (
    <>
      <ContentLayout>
        <Box
          bg="light.100"
          ml={smallscreen ? "1rem" : "0rem"}
        >
          {/* Searchbar */}
          <Stack direction={['column', 'row']} spacing='0.5rem' background={"gray.50"}>
          <InputGroup width={smallscreen ? "90vw" : "30rem"} background={"white"}>
            <InputLeftElement
              color="gray.300"
              pointerEvents="none"
              children={<IoSearchOutline />}
            />
            <Input borderRadius={0} onChange={servicesToggler} placeholder="Search for Services" />
          </InputGroup>
          <Select width={smallscreen ? "90vw" : "20rem"} background={"white"} borderRadius={0} color="gray.300" onChange={taskToggler}>
            <option  hidden defaultChecked>Select Task Type</option>
            <option value='translation'>Translation</option>
            <option value='tts'>TTS</option>
            <option value='asr'>ASR</option>
          </Select>
          <InputGroup width={smallscreen ? "90vw" : "30rem"} background={"white"}>
          <Select background={"white"} borderRadius={0} color="gray.300" onChange={sourceLangToggler}>
            <option  hidden defaultChecked>Source Language</option>
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
          </Select>
          <Select background={"white"} borderRadius={0} color="gray.300" onChange={targetLangToggler}>
            <option  hidden defaultChecked>Target Language</option>
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
            <option value='as'>Assamese</option>
            <option value='bn'>Bengali</option>
            <option value='gu'>Gujarati</option>
            <option value='kn'>Kannada</option>
            <option value='ml'>Malayalam</option>
            <option value='mr'>Marathi</option>
            <option value='or'>Oriya</option>
            <option value='pa'>Punjabi</option>
            <option value='ta'>Tamil</option>            
            <option value='te'>Telugu</option>
          </Select>
          </InputGroup>
          </Stack>
        </Box>
        <br />
        {smallscreen ? (
          // Mobile View
          filteredservices.length > 0?
          <>
            {Object.entries(filteredservices).map(([id, serviceData]) => (
              <ServiceCard
                key={id}
                name={serviceData.name}
                serviceID={serviceData.serviceId}
                modelID={serviceData.modelId}
                date={new Date(serviceData.publishedOn).toDateString()}
              />
            ))}
          </>
          :
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
            {(filteredservices.length>0)?            
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
                {Object.entries(filteredservices).map(([id, serviceData]) => {
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
            </Table>:
            <HStack background={"gray.50"}>
            <Spacer/>
            <Box textAlign={"center"} display={hide?"none":"block"}>
              <Image height={400} width={400}  alt="No Results Found" src="NoResults.svg"/>
              <Text fontSize={"lg"} color="gray.400">Uh Oh! No Results Found</Text>
            </Box>
            <Spacer/>
            </HStack>
            }
          </Box>
        )}
      </ContentLayout>
    </>
  );
}
