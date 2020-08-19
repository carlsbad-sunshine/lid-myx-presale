import React, { useState, useEffect } from "react";
import { createWatcher } from "@makerdao/multicall";
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

const INFURA_IDS = [
  "ae2a1095738a45158a9401678dcf74c3",
  "dfbec2f8c3b940e09e18c7692210370e",
  "f2ed9fbfc3104c44995dd5eef0be78f6"
]

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

const defaultWatcher = createWatcher([], {});
const walletWatcher = createWatcher([], {});

function App() {

  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/'+INFURA_IDS[Math.floor(Math.random() * 100 % 3)]))
  const [web3, setWeb3] = useState(new Web3(provider))

  const [isActive, setIsActive] = useState(false)

  const [lidPresaleSC, setLidPresale] = useState(null);
  const [depositVal, setDepositVal] = useState("");

  const [state, setState] = useState({
    startTime: Date.UTC(2020, 7, 13, 4, 0, 0, 0),
    endTime: null,
    totalEth: "0",
    totalDepositors: "0",
    accountShare: "0",
    accountEthDeposit: "0",
    currentPrice: "0",
    maxDeposit: "0",
    earnedReferrals: "0",
    referralCount: "0",
    finalEndTime: "0",
    accountRedeemable: "0",
    accountClaimedMYX: "0",
    maxShares: "0",
    isEnded: false
  });

  const {
    startTime,
    endTime,
    totalEth,
    totalDepositors,
    accountShare,
    accountEthDeposit,
    currentPrice,
    maxDeposit,
    earnedReferrals,
    referralCount,
    finalEndTime,
    accountRedeemable,
    accountClaimedMYX,
    maxShares,
    isEnded
  } = state;

  const toBN = web3.utils.toBN
  const toWei = web3.utils.toWei
  const fromWei = web3.utils.fromWei

  let referralAddress = window.location.hash.substr(2);
  if(!referralAddress || referralAddress.length !== 42 ) referralAddress = "0x0000000000000000000000000000000000000000"

  useEffect(() => {
    if (!web3) {
      return;
    }

    const multiCallConfig = {
      web3,
      multicallAddress: "0xeefba1e63905ef1d7acba5a8513c70307c1ce441",
      interval: 5000,
    };

    const presale = new web3.eth.Contract(abis.presale, addresses.presale);
    setLidPresale(presale);

    defaultWatcher.recreate(
      [
        {
          call: ["getEthBalance(address)(uint256)", addresses.presale],
          returns: [["totalEth", (val) => val.toString()]],
        },
        {
          target: addresses.redeemer,
          call: ["totalDepositors()(uint256)"],
          returns: [["totalDepositors", (val) => val.toString()]],
        },
        {
          target: addresses.presale,
          call: ["finalEndTime()(uint256)"],
          returns: [["finalEndTime", (val) => val.toString()]],
        },
        {
          target: addresses.presale,
          call: ["isPresaleEnded()(bool)"],
          returns: [["isEnded"]],
        },
        {
          target: addresses.redeemer,
          call: ["getMaxShares(uint256)(uint256)", toWei("1000")],
          returns: [["maxShares", (val) => val.toString()]],
        },
        {
          target: addresses.presale,
          call: ["getMaxWhitelistedDeposit()(uint256)"],
          returns: [["maxDeposit", (val) => val.toString()]],
        },
        {
          target: addresses.timer,
          call: ["endTime()(uint256)"],
          returns: [["endTime", (val) => new Date(endTime * 1000)]],
        },
      ],
      multiCallConfig
    );

    defaultWatcher.subscribe((update) => {
      setState((prevState) => ({
        ...prevState,
        [update.type]: update.value,
      }));
    });

    defaultWatcher.start();

  }, [web3]);

  useEffect(() => {
    if (!web3 || !address) {
      return;
    }
    
    const multiCallConfig = {
      web3,
      multicallAddress: "0xeefba1e63905ef1d7acba5a8513c70307c1ce441",
      interval: 5000,
    };
  
    walletWatcher.recreate(
      [
        {
          target: addresses.redeemer,
          call: ["accountShares(address)(uint256)", address],
          returns: [["accountShare", (val) => val.toString()]],
        },
        {
          target: addresses.redeemer,
          call: ["accountDeposits(address)(uint256)", address],
          returns: [["accountEthDeposit", (val) => val.toString()]],
        },
        {
          target: addresses.presale,
          call: ["earnedReferrals(address)(uint256)", address],
          returns: [["earnedReferrals", (val) => val.toString()]],
        },
        {
          target: addresses.presale,
          call: ["referralCounts(address)(uint256)", address],
          returns: [["referralCounts", (val) => val.toString()]],
        },
        {
          target: addresses.redeemer,
          call: ["accountClaimedTokens(address)(uint256)", address],
          returns: [["accountClaimedMYX", (val) => val.toString()]],
        },
        {
          target: addresses.redeemer,
          call: [
            "calculateRatePerEth(uint256,uint256,uint256)(uint256)",
            toWei("680000000"),
            totalEth,
            toWei("1000"),
          ],
          returns: [["currentPrice", (val) => val.toString()]],
        },
        {
          target: addresses.redeemer,
          call: [
            "calculateReedemable(address,uint256,uint256)(uint256)",
            address,
            finalEndTime,
            toWei("680000000"),
          ],
          returns: [["accountRedeemable", (val) => val.toString()]],
        },
      ],
      multiCallConfig
    );

    walletWatcher.subscribe((update) => {
      const { type, value } = update;
      setState((prevState) => ({
        ...prevState,
        [type]: value
      }));
    });

    walletWatcher.start();
  }, [web3, address, finalEndTime, totalEth])

  const handleDeposit = async function () {
    if(!depositVal) {
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

  return (
    <ThemeProvider theme={theme} >
      <CSSReset />
      <Header web3={web3} address={address} onConnect={onConnect} />
      <Subheading web3={web3} totalEth={totalEth}
        totalDepositors={totalDepositors} accountEthDeposit={accountEthDeposit} accountShare={accountShare} maxShares={maxShares}/>
      {(isActive & isEnded) &&
        <Claimer web3={web3} accountShare={accountShare} handleLidClaim={handleLidClaim} maxShares={maxShares}
            finalEndTime={finalEndTime} accountRedeemable={accountRedeemable} accountClaimedMYX={accountClaimedMYX} />
      }
      {(isActive && !isEnded) && (<>
        <EndTimer expiryTimestamp={endTime} />
        <DepositForm web3={web3} rate={currentPrice} cap={toWei("20")}
        accountDeposit={accountEthDeposit} setVal={setDepositVal} val={depositVal} handleClick={handleDeposit} />
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
