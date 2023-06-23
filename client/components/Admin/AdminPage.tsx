import { Box, Button, Center,Text } from '@chakra-ui/react';
import React, { useState } from 'react'
import AccessKeys from './AccessKeys'
import {BiArrowBack} from "react-icons/bi";
import useMediaQuery from '../../hooks/useMediaQuery';
import ExportFeedback from './ExportFeedback';

const AdminPage = () => {

  const [render, setRender] = useState(0);  
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
    <AccessKeys/>
    <ExportFeedback/>
    </>
    }
  </>
  );
}

export default AdminPage