"use client";

import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { truncatedAmount } from "@/utils/format";
import Web3Auth from "@/components/Web3Auth";

import {
  useNetwork,
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import {
  handleFailureNotification,
  handleSuccessNotification,
} from "../../../utils/notifications";

export default function App() {
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const [hasMounted, setHasMounted] = useState(false);

  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: account,
  });

  /**************************************
   *
   * Render UI
   *
   **************************************/

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  if (isError) return <div>Error fetching balance</div>;

  return (
    <ClientOnly>
      <Web3Auth />
    </ClientOnly>
  );
}
