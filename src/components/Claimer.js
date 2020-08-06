import React from "react"
import {CopyToClipboard} from 'react-copy-to-clipboard'
import { Text, Box, Button, Grid } from "@chakra-ui/core"
import {shortEther} from "../utils"
import CountDownShort from "./CountDownShort"

export default function Claimer({web3, hasSentToUniswap, hasIssuedTokens, hasSentEther, finalEndTime, accountLid, accountRedeemable, accountClaimedLid, handleLidClaim}) {
  const toBN = web3.utils.toBN
  const toWei = web3.utils.toWei
  const fromWei = web3.utils.fromWei

  return (<Box w="100%" maxWidth="1200px" ml="auto" mr="auto" mt="60px" mb="60px" pl={{base:"20px", lg:"0px"}} pr={{base:"20px", lg:"0px"}}>
    <Box textAlign="center" border="solid 1px" borderRadius="5px" borderColor="lid.stroke"bg="white" display="block" w="100%" mb="20px"
       p="20px">
       <Text fontSize={{base:"24px",sm:"36px"}} fontWeight="bold">
         Claim Your MYX
       </Text>
       <Text fontSize="18px" color="blue.500">
         2% released / hour
       </Text>
       <Text fontSize="18px" color="lid.fg">
         MYX to Claim: {shortEther(accountRedeemable,web3)}
       </Text>
       <Button variantColor="blue" bg="lid.brand" color="white"  border="none"  display="block"
         borderRadius="25px" w="200px" h="50px" m="0px" mt="30px"
         fontWeight="regular" fontSize="18px" ml="auto" mr="auto"
         onClick={handleLidClaim} >
         Claim
       </Button>
    </Box>
    <Grid w="100%" gap="20px" mb="40px"
      templateRows={{base:"repeat(2, 1fr)", md:"max-content"}}
      templateColumns={{base:"auto", md:"repeat(2, minmax(0, 1fr))"}}>
      <Box w="100%"  borderRadius="5px" p="25px" border="solid 1px" borderColor="lid.stroke" bg="lid.bg" >
        <Text fontSize="18px" m="0" p="0" color="lid.fgMed">
          Total MYX Claimed
        </Text>
        <Text fontSize="38px" w="100%" fontWeight="bold">
          {shortEther(accountClaimedLid,web3)}
        </Text>
      </Box>
      <Box w="100%"  borderRadius="5px" p="25px" border="solid 1px" borderColor="lid.stroke" bg="lid.bg" >
        <Text fontSize="18px" m="0" p="0" color="lid.fgMed">
          MYX / Hour
        </Text>
        <Text fontSize="38px" w="100%" fontWeight="bold">
          {shortEther(
            toBN(accountLid).mul(toBN("2")).div(toBN("100")),
            web3)
          }
        </Text>
      </Box>
    </Grid>
    <Box textAlign="center" border="solid 1px" borderRadius="5px" borderColor="lid.stroke"bg="white" display="block" w="100%" mb="20px"
         p="20px">
       <Text fontSize="18px" color="lid.fg">
         More MYX available to claim in
       </Text>
      <CountDownShort expiryTimestamp={new Date(toBN(finalEndTime).add(toBN("3600").mul(toBN("50"))).mul(toBN("1000")).toNumber())} />
    </Box>
  </Box>);
}
