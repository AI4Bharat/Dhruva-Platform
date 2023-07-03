import { Box, Button, Center,Divider,HStack,Spacer,Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react'
import AccessKeys from './AccessKeys'
import {BiAngry, BiArrowBack, BiKey} from "react-icons/bi";
import useMediaQuery from '../../hooks/useMediaQuery';
import ExportFeedback from './ExportFeedback';
import { MdOutlineFeedback, MdOutlineVpnKey, MdVpnKey } from 'react-icons/md';
import { FaKey } from 'react-icons/fa';

const AdminPage = () => {

  const [render, setRender] = useState(0);  
  const [selectedSection, setSelectedSection] = useState('accessKeys');
  const smallscreen = useMediaQuery("(max-width: 1080px)");


  let renderme;

  if(render == 0)
    renderme =
    <Box ml="1rem" mr="1rem">
        <Box background={"orange.500"} height="3rem" width="90vw" onClick={()=>setRender(1)}>
            <Center ml="1rem" mr="1rem">
                <Text color={"white"} mt="0.5rem" fontSize={"large"} fontWeight={"bold"}>API Keys</Text>
            </Center>
        </Box>
        <Box background={"orange.500"} mt="1rem" height="3rem" width="90vw" onClick={()=>setRender(2)}>
            <Center ml="1rem" mr="1rem">
                <Text color={"white"} mt="0.5rem" fontSize={"large"} fontWeight={"bold"}>Export Feedback</Text>
            </Center>
        </Box>
    </Box>
  else if (render == 1)
    renderme = <Box><Button variant={"link"} ml="1rem" onClick={()=>setRender(0)}><BiArrowBack/>&nbsp;Admin</Button ><AccessKeys/></Box> 
  else if (render == 2)
    renderme = <Box><Button variant={"link"} ml="1rem" onClick={()=>setRender(0)}><BiArrowBack/>&nbsp;Admin</Button ><ExportFeedback/></Box> 

  return (
  <>
    {smallscreen?
    renderme:
    <>
    <Box display="flex" ml="-0.5rem" height="100vh" mt="-0.5rem" >
      
      <VStack  align="start" spacing="10px" width="200px" background="white" padding="10px">
      <Divider />
      <Box height="2rem"></Box>
      <Box paddingTop="0.75rem" paddingBottom="0.75rem" paddingLeft={"0.5rem"}  width="100%" background={selectedSection == "accessKeys"?"orange.50":"white"} >
        <HStack>
        <Text
            fontWeight={selectedSection === 'accessKeys' ? 'bold' : 'normal'}
            cursor="pointer"
            onClick={() => setSelectedSection('accessKeys')}
          >
            Access Keys
          </Text>
          <BiKey/>
        </HStack>
      </Box>
      <Divider/>
      <Box paddingTop="0.75rem" paddingBottom="0.75rem" paddingLeft={"0.5rem"} width="100%" background={selectedSection == "exportFeedback"?"orange.50":"white"}>
        <HStack>
        <Text
          fontWeight={selectedSection === 'exportFeedback' ? 'bold' : 'normal'}
          cursor="pointer"
          onClick={() => setSelectedSection('exportFeedback')}
        >
          Export Feedback
        </Text>
        <MdOutlineFeedback/>
        </HStack>
        </Box>
      </VStack>
      <Box flex="1" padding="10px">
        {selectedSection === 'accessKeys' && <AccessKeys />}
        {selectedSection === 'exportFeedback' && <ExportFeedback />}
      </Box>
    </Box>
    </>
    }
  </>
  );
}

export default AdminPage