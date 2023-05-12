"use client";

import { useState } from "react";
import { SafeOnRampKit, StripePack } from "@safe-global/onramp-kit";

const OnRamp = ({ walletAddress }) => {
  const [address, setAddress] = useState<string>(
    localStorage.getItem("safeAddress") || ""
  );

  function handleAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAddress(event.target.value);
  }

  const fundWallet = async () => {
    const safeOnRamp = await SafeOnRampKit.init(
      new StripePack({
        stripePublicKey:
          "pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO",
        onRampBackendUrl: "https://aa-stripe.safe.global",
      })
    );

    const sessionData = await safeOnRamp.open({
      element: "#stripe-root",
      theme: "light",
      defaultOptions: {
        transaction_details: {
          // TODO : should be safe address not EOA address
          wallet_address: walletAddress,
          supported_destination_networks: ["ethereum", "polygon"],
          supported_destination_currencies: ["usdc"],
          lock_wallet_address: true,
        },
        customer_information: {
          email: "john@doe.com",
        },
      },
    });

    safeOnRamp.subscribe("onramp_ui_loaded", () => {
      console.log("UI loaded");
    });

    safeOnRamp.subscribe("onramp_session_updated", (e) => {
      console.log("Session Updated", e.payload);
    });
  };
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-md w-full my-4 ">
        <div id="stripe-root">
          <label>Destination Address</label>
          <input
            id="nickname"
            value={walletAddress}
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-3"
            onChange={(event) => {
              handleAddressChange(event);
            }}
          />
          <button
            disabled={!fundWallet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-2"
            onClick={() => {
              fundWallet?.();
            }}
          >
            Fund Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnRamp;
