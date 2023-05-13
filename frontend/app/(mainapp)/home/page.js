"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ADAPTER_EVENTS } from "@web3auth/base";
import getSafeAuth from "@/utils/safeAuth";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenericCard } from "@/components/GenericCard";

import { contractAddresses, contractAbi } from "@/constants/index";
import { ethers } from "ethers";

const connectedHandler = data => console.log("CONNECTED", data);
const disconnectedHandler = data => console.log("DISCONNECTED", data);

export default function Home() {
  const [safeAuth, setSafeAuth] = useState();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector()
  });
  const router = useRouter();
  const [loading, setLoading] = useState({
    web3: false,
    web2: false
  });
  const [eoaAddress, setEoaAddress] = useState(address);

  useEffect(() => {
    (async () => {
      const safeAuthKit = await getSafeAuth();

      safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);

      safeAuthKit.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler);

      setSafeAuth(safeAuthKit);

      return () => {
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler);
      };
    })();
  }, []);

  useEffect(() => {
    if (eoaAddress) {
      console.log("perform redirect");
      performRedirect();
    }
  }, [address, isConnected]);

  const getSafeAddressFromContract = async () => {
    const CHAIN_ID = 5;
    const contractAddress = contractAddresses[CHAIN_ID]["contract"];

    const safeAuthKit = await getSafeAuth();
    const provider = new ethers.providers.Web3Provider(safeAuthKit.getProvider());
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const safeAddress = await contract.getSafe();

    return safeAddress;
  };

  const performRedirect = async () => {
    const safeAddress = await getSafeAddressFromContract();
    console.log("safeAddress", safeAddress);
    const emptyAddress = /^0x0+$/.test(safeAddress);

    if (emptyAddress) {
      router.push("/safe");
    } else {
      router.push("/contacts");
    }
  };

  const socialLogin = async () => {
    if (!safeAuth) return;
    setLoading(prev => ({ ...prev, web2: true }));

    const response = await safeAuth.signIn();

    await setEoaAddress(response.eoa);
    await performRedirect();
  };

  const web3Login = async () => {
    setLoading(prev => ({ ...prev, web3: true }));
    connect();
  };

  const connectButton = () => {
    if (loading.web3) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button className="w-full" onClick={() => web3Login()}>
          Connect Wallet
        </Button>
      );
    }
  };

  const loginButton = () => {
    if (loading.web2) {
      return (
        <Button variant="secondary" disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button variant="secondary" className="w-full" onClick={() => socialLogin()}>
          Social Login
        </Button>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-6">SLICE</h1>
        <GenericCard title={"Pay, get paid and split bills in crypto using just a phone number."}>
          <div className="flex flex-col w-full max-w-sm items-center">
            {connectButton()}
            <p className="mt-6 mb-3 text-sm text-muted-foreground">{"Don't have a wallet? No problem!"}</p>
            {loginButton()}
          </div>
        </GenericCard>
      </main>
    </div>
  );
}
