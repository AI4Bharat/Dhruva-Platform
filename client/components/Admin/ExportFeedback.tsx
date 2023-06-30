import React, { useEffect, useState } from 'react';
import { VStack, Button, Box, Text, useToast, HStack, Stack, FormLabel, Select } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useMediaQuery from '../../hooks/useMediaQuery';
import { apiInstance, dhruvaAPI } from '../../api/apiConfig';
import { useQuery } from '@tanstack/react-query';
import { listServices } from '../../api/serviceAPI';

const ExportFeedback = () => {
    const smallscreen = useMediaQuery("(max-width: 1080px)");
    const [FromDate, setFromDate] = useState(null);
    const [selectedServiceID, setSelectedServiceID] = useState(null);
    const [ToDate, setToDate] = useState(null);
    const toast = useToast();
    const [FromUnix, setFromUnix] = useState<number>(null);
    const [ToUnix, setToUnix] = useState<number>(null);
    const { data: serviceslist } = useQuery(["services"], () => listServices());
    useEffect(() => {
        if (FromDate) {
          setFromUnix(Math.round(FromDate.getTime() / 1000));
        }
      }, [FromDate]);
    
    useEffect(() => {
        if (ToDate) {
          setToUnix(Math.round(ToDate.getTime() / 1000));
        }
      }, [ToDate]);

    const handleClick = () => {
        if (FromUnix && ToUnix) 
        {

          if (ToUnix - FromUnix < 0) {
            toast({
              title: 'From Date Should be less than To Date',
              status: 'warning',
              duration: 2000,
              isClosable: true,
            });
          } 
          else 
          {
            if(ToUnix - FromUnix > 604800)
            {
                toast({
                    title: 'Time Slot cannot be greater than one week',
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                });
            }
            else
            {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/services/feedback/export?fromDate=${FromUnix}&toDate=${ToUnix}`;
            // const url = `https://api.dhruva.co/services/feedback/export?serviceId=${selectedServiceID}&fromDate=${FromUnix}&toDate=${ToUnix}`;
            apiInstance
              .get(url, {
                responseType: 'blob',
              })
              .then((response) => {
                // Trigger the file download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'feedback.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              })
              .catch((error) => {
                // Handle the API error
                console.error(error);
                toast({
                  title: 'Error downloading CSV',
                  status: 'error',
                  duration: 2000,
                  isClosable: true,
                });
              });
            }
          }
        } 
        else 
        {
          toast({
            title: 'No date selected',
            status: 'warning',
            duration: 2000,
            isClosable: true,
          });
        }
      };
      
      

    const handleFrom = (date:number) => {
        setFromDate(date);
    };
    const handleTo = (date:number) => {
        setToDate(date);
    };
  
  return (
    <>
        <Box
        ml={smallscreen ? "1rem" : "2rem"}
        mr={smallscreen ? "1rem" : "2rem"}
        mt={smallscreen ? "-2rem" : "1rem"}
        >
        <HStack mt="3rem">
          {" "}
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            Export&nbsp;Feedback
          </Text>
        </HStack>
        <br/>
        <VStack spacing={4} align="flex-start">
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          Select&nbsp;Date&nbsp;Range:
        </Text>
        <br/>
        <Stack direction={['column','row']}>
        <HStack>
        <Text>From: </Text>
        <DatePicker
          selected={FromDate}
          onChange={handleFrom}
          customInput={<Box as="input" width={smallscreen?"100%":"100%"} px={2} py={1} borderWidth="1px" borderColor="gray.50" borderRadius="0" />}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        </HStack>
        <HStack>
        <Text>To: </Text>
        <DatePicker
          selected={ToDate}
          onChange={handleTo}
          showTimeSelect
          customInput={<Box as="input" width={smallscreen?"100%":"100%"} px={2} py={1} borderWidth="1px" borderColor="gray.50" borderRadius="0" />}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        </HStack>
        </Stack>
        <br/>
        {/* <Text fontSize="lg" fontWeight="bold">
          Select&nbsp;Service:
        </Text>
        <br/>
        <HStack>
              <Text>Service:</Text>
              <Select
                background={"white"}
                borderRadius={0}
                value={selectedServiceID}
                minWidth="15rem"
                onChange={(e) => {
                  setSelectedServiceID(e.target.value);
                }}
              >
                <option value="">None</option>
                {serviceslist?.map((s: any) => {
                  return <option value={s.serviceId}>{s.name}</option>;
                })}
              </Select>
        </HStack> */}
        </Box>
        {/* <br/> */}
        <Button colorScheme="orange" onClick={handleClick}>
        Download CSV
        </Button>
        </VStack>
        <br/><br/><br/>
        </Box>
    </>
  )
}

export default ExportFeedback