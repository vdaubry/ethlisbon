"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useConnect, useEnsName, useContract, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenericCard } from "@/components/GenericCard";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ethers } from "ethers";
import getSafeAuth from "@/utils/safeAuth";

import { GelatoRelay } from "@gelatonetwork/relay-sdk";

import { SafeOnRampKit, StripePack } from "@safe-global/onramp-kit";

import ERC20ABI from "./abi/ERC20.json";
import PayABI from "./abi/Pay.json";

const USDC_ADDRESS_GOERLI = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
const PAY_CONTRACT_ADDRESS = "0x5D05EAE2057Dc6cC36E3f79dA98365dEfD9489D5";
const CHAIN_ID = 5;
const STABLE_DECIMALS = 6;

export default function Pay() {
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
    address: PAY_CONTRACT_ADDRESS,
    abi: PayABI,
    chainId: CHAIN_ID,
    signerOrProvider: signer
  });

  const usdcContract = useContract({
    address: USDC_ADDRESS_GOERLI,
    abi: ERC20ABI,
    chainId: CHAIN_ID,
    signerOrProvider: signer
  });

  // Safe Core + Auth + Relay
  const [safeAuth, setSafeAuth] = useState();

  // Onramp
  const [safeOnRamp, setSafeOnRamp] = useState();

  // local state
  const [targetUser, setTargetUser] = useState(null);
  const [amountInCents, setAmountInCents] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [relayKitUrl, setRelayKitUrl] = useState(null);
  const [web3Success, setWeb3Success] = useState(false);

  const { data: ensName } = useEnsName({ address: targetUser, chainId: 1 });

  useEffect(() => {
    // Load information from URL
    const url = new URL(document.location);
    setTargetUser(url.searchParams.get("userAddress") || null);
    setAmountInCents(url.searchParams.get("amount") || null);
  });

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

  useEffect(() => {
    (async () => {
      const safeOnRamp = await SafeOnRampKit.init(
        new StripePack({
          stripePublicKey:
            "pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO",
          onRampBackendUrl: "https://aa-stripe.safe.global"
        })
      );

      setSafeOnRamp(safeOnRamp);
    })();
  }, []);

  useEffect(() => {
    if (relayKitUrl && !paymentInProgress) {
      setPaymentInProgress(true);
      trackRelayProgress();
    }
  }, [relayKitUrl]);

  const trackRelayProgress = async () => {
    const response = await fetch(relayKitUrl);
    const data = await response.json();

    if (data?.task?.taskState === "ExecSuccess") {
      setRelayKitUrl(null);
      setPaymentInProgress(false);
      setWeb3Success(true);
    } else {
      setTimeout(trackRelayProgress, 1000);
    }
  };

  const web3Login = async () => {
    setLoading(prev => ({ ...prev, web3: true }));
    await connect();
  };

  const settleSplitWeb3 = async () => {
    const localAmount = `${amountInCents.slice(0, -2)}.${amountInCents.slice(-2)}`;
    const amount = ethers.utils.parseUnits(localAmount, STABLE_DECIMALS);

    const allowance = await usdcContract.connect(signer).allowance(address, PAY_CONTRACT_ADDRESS);

    // our smart contract has allowance to do things gasless
    if (allowance > amount) {
      const { data } = await contract.connect(signer).populateTransaction.transfer(address, targetUser, amount);

      const request = {
        chainId: CHAIN_ID,
        target: PAY_CONTRACT_ADDRESS,
        data: data,
        gasLimit: "100000",
        isSponsored: true,
        user: await signer.getAddress()
      };

      const relayKit = new GelatoRelay();
      const response = await relayKit.sponsoredCall(request, "JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_");

      setRelayKitUrl(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
      console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);
    } else {
      // if it doesn't we do the web3 way with a regular transfer
      await usdcContract.connect(signer).transfer(targetUser, amount);
    }
  };

  const connectButton = () => {
    if (loading.web3) {
      return (
        <Button disabled className="my-6 w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else if (paymentInProgress) {
      return (
        <Button disabled className="my-6 w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Waiting for transaction to run
        </Button>
      );
    } else if (web3Success) {
      return (
        <Button className="my-6 w-full" variant="success">
          <Check className="mr-2 h-4 w-4" />
          You&apos;re settled!
        </Button>
      );
    } else if (address) {
      return (
        <Button className="my-4 w-full" onClick={() => settleSplitWeb3()}>
          Settle {parseAmount()}
        </Button>
      );
    } else {
      return (
        <Button className="my-4 w-full" onClick={() => web3Login()}>
          Pay with crypto
        </Button>
      );
    }
  };

  const stripeButton = () => {
    if (loading.web2) {
      return (
        <Button disabled className="w-full" variant="secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button className="w-full" variant="outline" onClick={() => stripeFlow()}>
          Pay with credit card
        </Button>
      );
    }
  };

  const stripeFlow = async () => {
    setLoading(prev => ({ ...prev, web2: true }));

    await safeOnRamp.open({
      element: "#stripe-root",
      theme: "light",
      defaultOptions: {
        transaction_details: {
          // TODO : should be safe address not EOA address
          wallet_address: targetUser,
          supported_destination_networks: ["ethereum", "polygon"],
          supported_destination_currencies: ["usdc"],
          lock_wallet_address: true
        },
        customer_information: {}
      }
    });

    safeOnRamp.subscribe("onramp_ui_loaded", () => {
      setLoading(prev => ({ ...prev, web2: false }));
    });

    safeOnRamp.subscribe("onramp_session_updated", e => {});
  };

  const prettyfyUserAddress = () => {
    if (!targetUser) return "Someone";

    if (ensName) return ensName;

    return `${targetUser.slice(0, 5)}...${targetUser.slice(-3)}`;
  };

  const parseAmount = () => {
    if (!amountInCents) return "$0.00";

    return `${amountInCents.slice(0, -2)}.${amountInCents.slice(-2)} USDC`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-6 ">
      <main className="flex flex-col items-center flex-1 px-20 text-center">
        <Image src={"/logo.svg"} width={600} height={200} className={"-mb-20"} alt="logo" />
        <GenericCard title={`${prettyfyUserAddress()} is asking for a slice 🍰`}>
          <div className="flex flex-col w-full max-w-sm items-center">
            <p className="text-xl bold mb-5">Amount: {parseAmount()}</p>
            <Separator className="mb-5" />
            <p className="text-sm text-gray-500">How do you want to settle the split?</p>
            {connectButton()}
            <Popover modal={true}>
              <PopoverTrigger asChild>{stripeButton()}</PopoverTrigger>
              <PopoverContent className="border-0 bg-transparent shadow-none w-96">
                <div id="stripe-root"></div>
              </PopoverContent>
            </Popover>
          </div>
        </GenericCard>
      </main>
    </div>
  );
}
