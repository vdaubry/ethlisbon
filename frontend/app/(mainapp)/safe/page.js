"use client";

import { ethers } from "ethers";
import Safe, { EthersAdapter, getSafeContract, SafeFactory } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { useCallback, useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import { OperationType } from "@safe-global/safe-core-sdk-types";

import { useNetwork, useAccount, useBalance } from "wagmi";

const RPC_URL = "https://goerli.infura.io/v3/c01468162cae4441ba6c94ac3ece1cc7";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Initialize signers
const owner1Signer = new ethers.Wallet("2409a99aa7bf315c140d1995e756d00397f08dc2d1a84e022ddec4cf3c31cb55", provider);

const ethAdapterOwner1 = new EthersAdapter({
  ethers,
  signerOrProvider: owner1Signer
});

const txServiceUrl = "https://safe-transaction-goerli.safe.global";
const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapterOwner1 });

export default function SafePage() {
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const [hasMounted, setHasMounted] = useState(false);
  const [safeAddress, setSafeAddress] = useState("0x6bC976Ad0a04BD58667461c1C29e5731F1Efa18A");

  useEffect(() => {
    if (!safeAddress) {
      safeSetup();
    }
  }, []);

  const safeSetup = useCallback(async () => {
    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapterOwner1 });
    console.log("Safe created");

    const safeAccountConfig = {
      owners: [await owner1Signer.getAddress()],
      threshold: 1
    };

    const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });
    console.log("Safe deployed");

    const _safeAddress = await safeSdkOwner1.getAddress();
    setSafeAddress(_safeAddress);

    console.log("Safe address: ", _safeAddress);
  }, []);

  const sendMoneyToSafe = async () => {
    const safeAmount = ethers.utils.parseUnits("0.01", "ether").toHexString();

    const transactionParameters = {
      to: safeAddress,
      value: safeAmount
    };

    const tx = await owner1Signer.sendTransaction(transactionParameters);

    console.log("Fundraising.");
    console.log(`Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`);
  };

  const proposeAndRunTransaction = async () => {
    console.log(safeAddress);
    const safeSDK = await Safe.create({ ethAdapter: ethAdapterOwner1, safeAddress });
    const destination = "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053";
    const amount = ethers.utils.parseUnits("0.005", "ether").toString();

    const safeTransactionData = {
      to: destination,
      data: "0x",
      value: amount
    };
    // Create a Safe transaction with the provided parameters
    const safeTransaction = await safeSDK.createTransaction({ safeTransactionData });

    console.log("Transaction created");
    // Deterministic hash based on transaction parameters
    const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);

    // Sign transaction to verify that the transaction is coming from owner 1
    const senderSignature = await safeSDK.signTransactionHash(safeTxHash);
    console.log("Transaction signed");

    await safeService.proposeTransaction({
      safeAddress,
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress: await owner1Signer.getAddress(),
      senderSignature: senderSignature.data
    });
    console.log("Transaction Proposed");

    // Sign & confirm
    const signature = await safeSDK.signTransactionHash(safeTxHash);
    const response = await safeService.confirmTransaction(safeTxHash, signature.data);
    console.log("Transaction confirmed");

    // execute
    const executeTxResponse = await safeSDK.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    console.log("Transaction executed:");
    console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`);
  };

  const transferThroughGelato = async () => {
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

    const safeSDK = await Safe.create({
      ethAdapter: ethAdapterOwner1,
      safeAddress
    });

    console.log("Safe created");

    const relayKit = new GelatoRelayPack("JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_");

    console.log("Gelato initialized");

    const safeTransaction = await safeSDK.createTransaction({ safeTransactionData });

    console.log("transaction initialized");

    const signedSafeTx = await safeSDK.signTransaction(safeTransaction);

    console.log("transaction signed");

    const safeSingletonContract = await getSafeContract({
      ethAdapter: ethAdapterOwner1,
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
  };

  /**************************************
   *
   * Render UI
   *
   **************************************/

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <ClientOnly>
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm">
          <p>Safe integration</p>
          <p>Connected Address: {account}</p>
          <p>Chain: {chain?.name}</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-2"
            onClick={() => sendMoneyToSafe()}
          >
            Transfer to Safe
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 my-2"
            onClick={() => proposeAndRunTransaction()}
          >
            Send from Safe
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 my-2"
            onClick={() => transferThroughGelato()}
          >
            Send Gelato
          </button>
        </div>
      </div>
    </ClientOnly>
  );
}
