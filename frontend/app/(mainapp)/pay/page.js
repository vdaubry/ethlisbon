"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useEnsName, useContract, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenericCard } from "@/components/GenericCard";
import { Separator } from "@/components/ui/separator";

import { ethers } from "ethers";
import getSafeAuth from "@/utils/safeAuth";

import { GelatoRelay } from "@gelatonetwork/relay-sdk";

import ERC20ABI from "./abi/ERC20.json";

const USDC_ADDRESS_GOERLI = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
const CHAIN_ID = 5;
const STABLE_DECIMALS = 6;

export default function Home() {
  // Web3 Account
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector()
  });
  const [loading, setLoading] = useState({
    web3: false,
    web2: false
  });
  const { data: signer } = useSigner();

  // Web3 TX details
  const contract = useContract({
    address: USDC_ADDRESS_GOERLI,
    abi: ERC20ABI,
    chainId: CHAIN_ID,
    signerOrProvider: signer
  });

  // Safe Core + Auth + Relay
  const [safeAuth, setSafeAuth] = useState();

  // Load information from URL
  const url = new URL(document.location);
  const [targetUser, setTargetUser] = useState(url.searchParams.get("userAddress") || null);
  const [amountInCents, setAmountInCents] = useState(url.searchParams.get("amount") || null);

  const { data: ensName } = useEnsName({ address: targetUser, chainId: 1 });

  useEffect(() => {
    (async () => {
      const safeAuthKit = await getSafeAuth();
      setSafeAuth(safeAuthKit);
    })();
  }, []);

  useEffect(() => {
    if (address) {
      setLoading(prev => ({ ...prev, web3: false }));
    }
  }, [address, isConnected]);

  const web3Login = async () => {
    setLoading(prev => ({ ...prev, web3: true }));
    await connect();
  };

  const settleSplitWeb3 = async () => {
    // @TODO - implement web3 flow
    console.log("web3 flow");

    const localAmount = `${amountInCents.slice(0, -2)}.${amountInCents.slice(-2)}`;
    const amount = ethers.utils.parseUnits(localAmount, STABLE_DECIMALS);

    const balance = await contract.balanceOf(address);

    console.log(balance.toString());
    console.log(amount.toString());
    console.log(localAmount);
    console.log(await signer.getAddress());
    console.log(targetUser);

    // await contract.connect(signer).transfer(targetUser, amount);

    const { data } = await contract.connect(signer).populateTransaction.transfer(targetUser, amount);

    console.log("TX Populated");

    const request = {
      chainId: CHAIN_ID,
      target: USDC_ADDRESS_GOERLI,
      data: data,
      gasLimit: "100000",
      isSponsored: true,
      user: await signer.getAddress()
    };

    const relayKit = new GelatoRelay();

    console.log("Gelato initialized - sending sponsored call");

    const response = await relayKit.sponsoredCall(request, "JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_");

    console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);
  };

  const connectButton = () => {
    if (loading.web3) {
      return (
        <Button disabled className="my-6 w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else if (address) {
      return (
        <Button className="my-6 w-full" onClick={() => settleSplitWeb3()}>
          Settle {parseAmount()}
        </Button>
      );
    } else {
      return (
        <Button className="my-6 w-full" onClick={() => web3Login()}>
          Connect Wallet
        </Button>
      );
    }
  };

  const stripeButton = () => {
    if (loading.web2) {
      return (
        <Button disabled className="my-6 w-full" variant="secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button className="my-6 w-full" variant="outline" onClick={() => web3Login()}>
          I don't have crypto
        </Button>
      );
    }
  };

  const stripeFlow = () => {
    // @TODO - implement stripe flow
    setLoading(prev => ({ ...prev, web2: true }));
    console.log("stripe flow");
  };

  const prettyfyUserAddress = () => {
    if (!targetUser) return "Someone";

    if (ensName) return ensName;

    return `${targetUser.slice(0, 5)}...${targetUser.slice(-3)}`;
  };

  const parseAmount = () => {
    if (!amountInCents) return "$0.00";

    return `$${amountInCents.slice(0, -2)}.${amountInCents.slice(-2)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-6">SLICE</h1>
        <GenericCard title={"Split"} subtitle={`${prettyfyUserAddress()} wants to split with you!`}>
          <div className="flex flex-col w-full max-w-sm items-center">
            <p className="text-xl bold mb-5">Amount: {parseAmount()}</p>
            <Separator className="mb-5" />
            <p className="text-sm text-gray-500">Want to settle the split with crypto?</p>
            {connectButton()}
            <Separator className="mb-5" />
            <p className="text-sm text-gray-500">Don't have crypto? Use your Credit Card.</p>
            {stripeButton()}
          </div>
        </GenericCard>
      </main>
    </div>
  );
}
