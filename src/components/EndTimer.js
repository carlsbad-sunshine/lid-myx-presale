import React, {useEffect} from 'react';
import { useTimer } from 'react-timer-hook';
import { Text, Box } from "@chakra-ui/core"
import CountDown from "./CountDown"

export default function EndTimer({ expiryTimestamp }) {
  return (
    <Box display="block" w="100%" mt="40px" mb="40px"
    pl={{base:"20px", lg:"0px"}} pr={{base:"20px", lg:"0px"}}
    maxW="1200px" ml="auto" mr="auto" textAlign="center">
      <Text fontSize={{base:"28px", sm:"36px"}}  fontWeight="bold" >
        MYX Presale ends in
      </Text>
      <CountDown expiryTimestamp={(expiryTimestamp == null ? new Date() : expiryTimestamp)} />
      <Text fontSize={{base:"12px", sm:"14px"}} fontWeight="light" mt="-20px">
        7 day timer.
      </Text>
      <Text fontSize={{base:"12px", sm:"14px"}}  fontWeight="light">
        Ends after 7 days or 1000 ETH.
      </Text>
    </Box>
  )
}
