import { Box, Button, Center,Text } from '@chakra-ui/react';
import React, { useState } from 'react'
import AccessKeys from './AccessKeys'
import {BiArrowBack} from "react-icons/bi";
import useMediaQuery from '../../hooks/useMediaQuery';

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
    </Box>
  else if (render == 1)
    renderme = <Box><Button variant={"link"} ml="1rem" onClick={()=>setRender(0)}><BiArrowBack/>&nbsp;Admin</Button ><AccessKeys/></Box> 

  return (
  <>
    {smallscreen?
    renderme:
    <>
    <AccessKeys/>
    </>
    }
  </>
  );
}

export default AdminPage