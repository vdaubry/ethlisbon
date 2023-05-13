"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ADAPTER_EVENTS } from "@web3auth/base";
import getSafeAuth from "@/utils/safeAuth";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    if (address) {
      router.push("/contacts");
    }
  }, [address, isConnected]);

  const socialLogin = async () => {
    if (!safeAuth) return;
    setLoading(prev => ({ ...prev, web2: true }));

    const response = await safeAuth.signIn();
    if (response.eoa) {
      router.push("/safe");
    }
  };

  const web3Login = async () => {
    setLoading(prev => ({ ...prev, web3: true }));
    connect();
  };

  const connectButton = () => {
    if (loading.web3) {
      return (
        <Button disabled className="my-6">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button className="my-6" onClick={() => web3Login()}>
          Connect Wallet
        </Button>
      );
    }
  };

  const loginButton = () => {
    if (loading.web2) {
      return (
        <Button disabled className="my-6">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return <Button onClick={() => socialLogin()}>Social Login</Button>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <main className="flex flex-col items-center justify-center">
        {connectButton()}
        <p className="mt-6 mb-3 text-lg">{"Don't have a wallet? No problem!"}</p>
        {loginButton()}
      </main>
    </div>
  );
}
