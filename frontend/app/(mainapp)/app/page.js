"use client";

import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { truncatedAmount } from "@/utils/format";

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
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm">
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 block max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-4">
            <div className="text-2xl font-semibold text-white">
              {isLoading && (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              )}
              <p>
                Your balance is: {truncatedAmount(balance?.value)}{" "}
                {balance?.symbol}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
