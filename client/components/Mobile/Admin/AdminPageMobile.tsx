import { Box, Button, Center, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import {BiArrowBack} from "react-icons/bi";
import AccessKeys from '../../Admin/AccessKeys';

const AdminPageMobile = () => {

  const [render, setRender] = useState(0);  

  let renderme;

  if(render == 0)
    renderme =
    <Box ml="1rem" mr="1rem">
        <Box background={"orange.100"} height="3rem" width="90vw" onClick={()=>setRender(1)}>
            <Center ml="1rem" mr="1rem">
                <Text  mt="0.5rem" fontSize={"large"} fontWeight={"bold"}>API Keys</Text>
            </Center>
        </Box>
    </Box>
  else if (render == 1)
    renderme = <Box><Button variant={"link"} ml="1rem" onClick={()=>setRender(0)}><BiArrowBack/>&nbsp;Admin</Button ><AccessKeys/></Box> 

  return (<>{renderme}</>);
}

export default AdminPageMobile