"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthOptions } from "@web3auth/modal";
import { EthHashInfo } from "@safe-global/safe-react-components";

import { GelatoRelayPack } from "@safe-global/relay-kit";
import { ethers } from "ethers";
import Safe, { EthersAdapter, getSafeContract, SafeFactory } from "@safe-global/protocol-kit";
import {
  SafeAuthKit,
  SafeAuthSignInData,
  Web3AuthModalPack,
  Web3AuthEventListener,
} from "@/utils/safe-core/index";
import { OperationType } from "@safe-global/safe-core-sdk-types";

const connectedHandler: Web3AuthEventListener = (data) =>
  console.log("CONNECTED", data);
const disconnectedHandler: Web3AuthEventListener = (data) =>
  console.log("DISCONNECTED", data);

const Web3Auth = () => {
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<SafeAuthSignInData | null>(null);
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>();
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const options: Web3AuthOptions = {
        clientId:
          "BNcj0sLcTDZbJROfleFr6YPIcfIX6-Z2ZPFiIkl3Pvqtavkxhcn4hK5nrY_MWcovRQdvwCWhj6s_ufi8TbC34oU",
        web3AuthNetwork: "testnet",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x5",
          rpcTarget:
            "https://goerli.infura.io/v3/c01468162cae4441ba6c94ac3ece1cc7",
        },
        uiConfig: {
          theme: "dark",
          loginMethodsOrder: ["google", "facebook"],
        },
      };

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: "metamask",
          showOnDesktop: true,
          showOnMobile: false,
        },
      };

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: "mandatory",
        },
        adapterSettings: {
          uxMode: "popup",
          whiteLabel: {
            name: "Safe",
          },
        },
      });

      const adapter = new Web3AuthModalPack(
        options,
        [openloginAdapter],
        modalConfig
      );

      const safeAuthKit = await SafeAuthKit.init(adapter, {
        txServiceUrl: "https://safe-transaction-goerli.safe.global",
      });

      safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);

      safeAuthKit.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler);

      setSafeAuth(safeAuthKit);

      return () => {
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);
        safeAuthKit.unsubscribe(
          ADAPTER_EVENTS.DISCONNECTED,
          disconnectedHandler
        );
      };
    })();
  }, []);

  const login = async () => {
    if (!safeAuth) return;

    const response = await safeAuth.signIn();
    console.log("SIGN IN RESPONSE: ", response);

    setSafeAuthSignInResponse(response);
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider);
    setUserAddress(response.eoa);
  };

  const createSafe = async () => {
    const provider = new ethers.providers.Web3Provider(safeAuth.getProvider());
    const signer = provider.getSigner();

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer || provider
    })

    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });
    console.log("Safe created");

    const safeAccountConfig = {
      owners: [await signer.getAddress()],
      threshold: 1
    };

    const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });
    console.log("Safe deployed");

    const _safeAddress = await safeSdkOwner1.getAddress();

    console.log("Safe address: ", _safeAddress);
  };

  const sendMoneyToSafe = async () => {
    const provider = new ethers.providers.Web3Provider(safeAuth.getProvider());
    const signer = provider.getSigner();

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer || provider
    })

    const safeAddress = "0x8A1385140F9d31B34c6659063BAf7bc5238db2e9";

    const safeSDK = await Safe.create({
      ethAdapter: ethAdapter,
      safeAddress
    });

    const destinationAddress = "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053";
    const withdrawAmount = ethers.utils.parseUnits("0.005", "ether").toString();

    const gasLimit = "100000";
    const safeTransactionData = {
      to: destinationAddress,
      data: "0x", // leave blank for native token transfers
      value: withdrawAmount,
      operation: OperationType.Call
    };

    const options = {
      gasLimit,
      isSponsored: true
    };

    console.log("DATA Prepared");

    const relayKit = new GelatoRelayPack("JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_");

    console.log("Gelato initialized");

    const safeTransaction = await safeSDK.createTransaction({ safeTransactionData });

    console.log("transaction initialized");

    const signedSafeTx = await safeSDK.signTransaction(safeTransaction);

    console.log("transaction signed");

    const safeSingletonContract = await getSafeContract({
      ethAdapter: ethAdapter,
      safeVersion: await safeSDK.getContractVersion()
    });

    console.log("safe contract fetched");

    const encodedTx = safeSingletonContract.encode("execTransaction", [
      signedSafeTx.data.to,
      signedSafeTx.data.value,
      signedSafeTx.data.data,
      signedSafeTx.data.operation,
      signedSafeTx.data.safeTxGas,
      signedSafeTx.data.baseGas,
      signedSafeTx.data.gasPrice,
      signedSafeTx.data.gasToken,
      signedSafeTx.data.refundReceiver,
      signedSafeTx.encodedSignatures()
    ]);

    console.log("tx encoded");

    const relayTransaction = {
      target: safeAddress,
      encodedTransaction: encodedTx,
      chainId: 5, // GOERLI
      options
    };

    console.log("relay sent");
    const response = await relayKit.relayTransaction(relayTransaction);

    console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);
  }

  const logout = async () => {
    if (!safeAuth) return;

    await safeAuth.signOut();

    setProvider(null);
    setSafeAuthSignInResponse(null);
    setUserAddress(null);
  };

  return (
    <>
      <div className="flex items-center justify-center w-full h-full">
        <div className="max-w-md w-full my-4 ">
          <div className="bg-slate-300 shadow-md rounded px-8 pt-6 pb-8">
            <div className="mb-4">
              <h2 className="block text-gray-700 text-2xl font-bold mb-2">
                Sign In With Web3Auth
              </h2>
            </div>
            <div>
              <p>Your EOA address: </p>
              <p>{userAddress}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={!login}
                onClick={() => {
                  login?.();
                }}
              >
                Sign In
              </button>
              {userAddress && (
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={!logout}
                  onClick={() => {
                    logout?.();
                  }}
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
          {userAddress && (
            <div className="flex items-center justify-between mt-5">
              <Link href={`/wallets/${userAddress}/onramp`}>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Fund your wallet
                </button>
              </Link>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => sendMoneyToSafe()}
              >
                Send funds to safe
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => createSafe()}
              >
                Create Safe
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Web3Auth;
