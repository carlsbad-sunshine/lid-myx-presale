import React, { useState, useEffect } from "react";
import addresses from "./contracts/addresses";
import abis from "./contracts/abis";
import { ThemeProvider, CSSReset, Box } from "@chakra-ui/core"
import theme from "./theme"
import "./App.css";

import Web3 from "web3";
import Web3Modal from "web3modal";

import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";
import UniLogin from "@unilogin/provider";
import Portis from "@portis/web3";
import Squarelink from "squarelink";
import MewConnect from "@myetherwallet/mewconnect-web-client";

import Header from "./components/Header"
import Subheading from "./components/Subheading"
import CountDown from "./components/CountDown"
import EndTimer from "./components/EndTimer"
import StartTimer from "./components/StartTimer"
import ReferralCode from "./components/ReferralCode"
import Footer from "./components/Footer"
import DepositForm from "./components/DepositForm"
import PresaleCompletion from "./components/PresaleCompletion"
import Claimer from "./components/Claimer"

const INFURA_ID = "f955014944b64ba2b1cab50d496a2b90"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "29a7f0c37b214a90934bec1b032d5c8f" // required
    }
  },
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: "pk_live_B853BB3433E80B5B" // required
    }
  },
  torus: {
    package: Torus, // required
  },
  authereum: {
    package: Authereum // required
  },
  unilogin: {
    package: UniLogin // required
  },
  portis: {
    package: Portis, // required
    options: {
      id: "9b1635c2-43f4-4cbe-b8b6-73bf219d6a77" // required
    }
  },
  squarelink: {
    package: Squarelink, // required
    options: {
      id: "48ff2cdfaf26656bbd86" // required
    }
  },
  mewconnect: {
    package: MewConnect, // required
    options: {
      infuraId: "53a6aee5a5c74599b815999befb91ecc" // required
    }
  }
}

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});



function App() {

  const [address, setAddress] = useState("")
  const [provider, setProvider] = useState(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/'+INFURA_ID))
  const [web3, setWeb3] = useState(new Web3(provider))
  const [connected, setConnected] = useState(false)

  const [startTime, setStartTime] = useState(Date.UTC(2020,7,13,4,0,0,0))
  const [endTime, setEndTime] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [isEnded, setIsEnded] = useState(false)

  const [lidPresaleSC, setLidPresale] = useState(null)
  const [lidTimerSC, setLidTimerSC] = useState(null)
  const [lidTokenSC, setLidTokenSC] = useState(null)

  const [totalLid, setTotalLid] = useState("0")
  const [totalEth, setTotalEth] = useState("0")
  const [totalDepositors, setTotalDepositors] = useState("0")

  const [accountLid, setAccountLid] = useState("0")
  const [accountEthDeposit, setAccountEthDeposit] = useState("0")
  const [isWhitelisted, setIsWhitelisted] = useState(false)

  const [currentPrice, setCurrentPrice] = useState("0")
  const [maxDeposit, setMaxDeposit] = useState("0")
  const [earnedReferrals, setEarnedReferrals] = useState("0")
  const [referralCount, setReferralCount] = useState("0")

  const [hasSentToUniswap, setHasSentToUniswap] = useState(false)
  const [hasIssuedTokens, setHasIssuedTokens] = useState(false)
  const [hasSentEther, setHasSentEther] = useState(false)
  const [finalEndTime, setFinalEndTime] = useState("0")
  const [accountRedeemable, setAccountRedeemable] = useState("0")
  const [accountClaimedLid, setAccountClaimedLid] = useState("0")

  const [depositVal, setDepositVal] = useState("")
  const [maxShares, setMaxShares] = useState("0")

  const toBN = web3.utils.toBN
  const toWei = web3.utils.toWei
  const fromWei = web3.utils.fromWei

  let referralAddress = window.location.hash.substr(2);
  if(!referralAddress || referralAddress.length !== 42 ) referralAddress = "0x0000000000000000000000000000000000000000"

  useEffect(()=>{
    if(!web3) return
    if(!address) return

    const presale = new web3.eth.Contract(abis.presale, addresses.presale)
    const timer = new web3.eth.Contract(abis.timer, addresses.timer)
    const redeemer = new web3.eth.Contract(abis.redeemer, addresses.redeemer)
    const token = new web3.eth.Contract(abis.token, addresses.token)

    setLidPresale(presale)

    //TODO: Switch to multicall.js
    let fetchData = async(web3,address,presale,timer,redeemer,token)=>{
      const [
        totalLid,
        totalEth,
        totalDepositors,
        accountLid,
        accountEthDeposit,
        earnedReferrals,
        referralCount,
        hasSentToUniswap,
        hasIssuedTokens,
        finalEndTime,
        accountClaimedLid,
        isEnded,
        maxShares
      ] = await Promise.all([
        presale.methods.totalTokens().call(),
        web3.eth.getBalance(addresses.presale),
        redeemer.methods.totalDepositors().call(),
        redeemer.methods.accountShares(address).call(),
        redeemer.methods.accountDeposits(address).call(),
        presale.methods.earnedReferrals(address).call(),
        presale.methods.referralCounts(address).call(),
        presale.methods.hasSentToUniswap().call(),
        presale.methods.hasIssuedTokens().call(),
        presale.methods.finalEndTime().call(),
        redeemer.methods.accountClaimedTokens(address).call(),
        presale.methods.isPresaleEnded().call(),
        redeemer.methods.getMaxShares(toWei("1000")).call()
      ])

      const [
        maxDeposit,
        endTime,
        currentPrice,
        accountRedeemable
      ] = await Promise.all([
        presale.methods.getMaxWhitelistedDeposit().call(),
        timer.methods.endTime().call(),
        redeemer.methods.calculateRatePerEth(toWei("430000000"),totalEth,toWei("1000")).call(),
        redeemer.methods.calculateReedemable(address, finalEndTime, toWei("430000000")).call()
      ])
      console.log("maxShares",maxShares)
      console.log("maxShares string",maxShares.toString())
      setTotalLid(totalLid)
      setTotalEth(totalEth)
      setTotalDepositors(totalDepositors)
      setAccountLid(accountLid)
      setAccountEthDeposit(accountEthDeposit)
      setCurrentPrice(currentPrice)
      setEarnedReferrals(earnedReferrals)
      setReferralCount(referralCount)
      setIsWhitelisted(isWhitelisted)
      setMaxDeposit(maxDeposit)
      setEndTime(new Date(endTime*1000))
      setHasSentToUniswap(hasSentToUniswap)
      setHasIssuedTokens(hasIssuedTokens)
      setHasSentEther(hasSentEther)
      setFinalEndTime(finalEndTime)
      setAccountRedeemable(accountRedeemable)
      setAccountClaimedLid(accountClaimedLid)
      setIsEnded(isEnded)
      setMaxShares(maxShares)
    }

    fetchData(web3,address,presale,timer,redeemer,token)

    let interval;
    if(window.web3){
      interval = setInterval((web3,address,presale,timer,redeemer,token)=>{
        if(!web3 || !address || !presale || !timer || !redeemer) return
        fetchData(web3,address,presale,timer,redeemer,token)
      },2000)
    }else{
      interval = setInterval((web3,address,presale,timer,redeemer,token)=>{
        if(!web3 || !address || !presale || !timer || !redeemer) return
        fetchData(web3,address,presale,timer,redeemer,token)
      },10000)
    }

    return ()=>clearInterval(interval)

  },[web3,address])

  const handleDeposit = async function () {
    if(depositVal == "" || depositVal == null || depositVal == undefined) {
      alert("Must enter a value between 0.01 eth and max.")
      return
    }
    if(toBN(depositVal).lt(toBN(toWei("0.01")))) {
      alert("Must enter a value between 0.01 eth and max.")
      return
    }
    if(toBN(maxDeposit).lt(toBN(depositVal))) {
      alert("Must enter a value between 0.01 eth and max.")
      return
    }
    const balance = await web3.eth.getBalance(address)
    if(toBN(balance).lt(toBN(depositVal))) {
      alert("Must enter a value lower than your ETH balance.")
      return
    }
    await lidPresaleSC.methods.deposit(referralAddress).send({from:address,value:depositVal})
    alert("Deposit request sent. Check your wallet to see when it has completed, then refresh this page.")
  }

  const handleLidClaim = async function() {
    if(toBN(accountRedeemable).lt(toBN("1"))) {
      alert("You must have at least 1 wei of LID to claim.")
      return
    }
    await lidPresaleSC.methods.redeem().send({from: address})
    alert("Claim request sent. Check your wallet to see when it has completed, then refresh this page.")
  }

  const handleSendToUniswap = async function() {
    await lidPresaleSC.methods.sendToUniswap().send({from: address})
  }

  const handleIssueTokens = async function() {
    await lidPresaleSC.methods.issueTokens().send({from: address})
  }

  const resetApp = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setAddress("")
    setWeb3(null)
    setProvider(null)
    setConnected(false)
  };

  //TODO: event subscriptions to auto update UI
  const subscribeProvider = async (provider,web3) => {
      if (!provider.on) {
        return
      }
      provider.on("close", () => resetApp(web3));
      provider.on("accountsChanged", async (accounts) => {
        setAddress(accounts[0])
      });
    };

  const onConnect = async () => {
    const provider = await web3Modal.connect()
    const web3 = await new Web3(provider)
    await subscribeProvider(provider,web3)
    const accounts = await web3.eth.getAccounts()
    const address = accounts[0]

    setConnected(true)
    setAddress(address)
    setProvider(provider)
    setWeb3(web3)
  }

  useEffect(()=>{
    if(window.web3) onConnect()
  },[])

  useEffect(()=>{
    setIsActive(true)
    if(Date.now() < startTime){
      let interval = setInterval(()=>{
        setIsActive(Date.now() > startTime)
      },500)
      return ()=>clearInterval(interval)
    } else {
      setIsActive(true)
    }
  },[startTime])


  console.log("appweb3",web3)
  return (
    <ThemeProvider theme={theme} >
      <CSSReset />
      <Header web3={web3} address={address} onConnect={onConnect} isWhitelisted={isWhitelisted} />
      <Subheading web3={web3} address={address} totalLid={totalLid} totalEth={totalEth}
        totalDepositors={totalDepositors} accountEthDeposit={accountEthDeposit} accountLid={accountLid} maxShares={maxShares}/>
      {(isActive & isEnded) &&
        <Claimer web3={web3} accountLid={accountLid} handleLidClaim={handleLidClaim} maxShares={maxShares}
            hasSentToUniswap={hasSentToUniswap} hasIssuedTokens={hasIssuedTokens} hasSentEther={hasSentEther}
            finalEndTime={finalEndTime} accountRedeemable={accountRedeemable} accountClaimedLid={accountClaimedLid} />
      }
      {(isActive && !isEnded) && (<>
        <EndTimer expiryTimestamp={endTime} />
        <DepositForm web3={web3} rate={currentPrice} cap={toWei("20")}
        accountDeposit={accountEthDeposit} setVal={setDepositVal} val={depositVal} handleClick={handleDeposit} isWhitelisted={false} />
        </>)
      }
      {(!isActive && !isEnded) &&
        <StartTimer expiryTimestamp={startTime} />
      }
      <ReferralCode web3={web3} address={address} earnedReferrals={earnedReferrals} referralCount={referralCount} />
      <Box w="100%" maxW="1200px" bg="lid.stroke" height="1px" mt="40px" mb="40px" ml="auto" mr="auto"/>
      {(isActive && isEnded) &&
        <PresaleCompletion isActive={isActive} isEnded={isEnded}
          handleSendToUniswap={handleSendToUniswap}
          handleIssueTokens={handleIssueTokens}
        />
      }

      <Footer />
    </ThemeProvider>
  );
}

export default App;
