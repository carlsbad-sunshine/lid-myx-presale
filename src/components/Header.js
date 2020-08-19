import React from 'react';
import { Text, Box, Flex, Image, Link, Button } from "@chakra-ui/core"
import Blockie from "./Blockie"

export default function Header({web3, address, onConnect}) {

  return (
    <Box w="100%" bg="lid.bgMed" m="0" pt="0px">
      <Flex maxW="1200px" align="center" ml="auto" mr="auto"
          pt="20px" pl={{base:"20px", lg:"0px"}} pr={{base:"20px", lg:"0px"}} >
        <Link display="inline-block" href="https://myx.network" m="0px" ml="-3px">
          <Image src="/logo.png" alt="myx Website" w="auto" h="60px" display="inline-block" position="relative" top="-10px"/>
          <Text as="span" fontWeight="bold" fontSize={{base:"28px", sm:"42px"}} display="inline-block" ml="20px" color="lid.brand" >
            MYX Presale
          </Text>
        </Link>
        { (web3 && address) ?
          (<Box ml="auto" display="inline-block">

            <Blockie address={address} size={40} />
            <Text fontSize="10px" textAlign="center" fontFamily="monospace" color="lid.dkGray">{address.substring(0, 6)}</Text>
          </Box>)
          :
          (
            <Button variant="solid" background="lid.buttonBgDk" color="lid.bg" ml="auto"
              p="25px" w="140px" fontSize="18px" fontWeight="500" borderRadius="25px"
            onClick={onConnect}>Connect
            </Button>
          )
        }
      </Flex>
      <Box color="lid.fgMed" display="block" w="100%"  pl={{base:"20px", lg:"0px"}} pr={{base:"20px", lg:"0px"}} maxW="1200px" ml="auto" mr="auto">
        <Link display="inline-block" href="https://lid.sh" m="0px" >
          <Image src="/logo-lid.png" alt="myx Website" w="auto" h="20px" display="inline-block" position="relative" top="-3px"/>
          <Text as="span" fontWeight="bold" display="inline-block" ml="5px" >
            Lid Simplified Presale v0.3.1
          </Text>
        </Link>
        <Text fontSize="12px" color="lid.fgLight" >
          Lid Certification only protects against exit scams.<br/>
          It does not provide any other guarantees.
        </Text>
      </Box>

    </Box>
  );
}
