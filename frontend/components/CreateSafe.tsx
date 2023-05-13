"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ADAPTER_EVENTS, SafeEventEmitterProvider } from "@web3auth/base";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import { ethers } from "ethers";
import Safe, {
	EthersAdapter,
	getSafeContract,
	SafeFactory,
} from "@safe-global/protocol-kit";
import {
	SafeAuthKit,
	SafeAuthSignInData,
	Web3AuthModalPack,
	Web3AuthEventListener,
} from "@/utils/safe-core/index";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import getSafeAuth from "@/utils/safeAuth";

const Web3Auth = () => {
	const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
		useState<SafeAuthSignInData | null>(null);
	const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>();
	const [userAddress, setUserAddress] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			const safeAuthKit = await getSafeAuth();

			const response = await safeAuthKit.signIn();
			setUserAddress(response.eoa);
			setSafeAuth(safeAuthKit);
		})();
	}, []);

	const createSafe = async () => {
		const provider = new ethers.providers.Web3Provider(safeAuth.getProvider());
		const signer = provider.getSigner();

		const ethAdapter = new EthersAdapter({
			ethers,
			signerOrProvider: signer || provider,
		});

		const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });
		console.log("Safe created");

		const safeAccountConfig = {
			owners: [await signer.getAddress()],
			threshold: 1,
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
			signerOrProvider: signer || provider,
		});

		const safeAddress = "0x8A1385140F9d31B34c6659063BAf7bc5238db2e9";

		const safeSDK = await Safe.create({
			ethAdapter: ethAdapter,
			safeAddress,
		});

		const destinationAddress = "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053";
		const withdrawAmount = ethers.utils.parseUnits("0.005", "ether").toString();

		const gasLimit = "100000";
		const safeTransactionData = {
			to: destinationAddress,
			data: "0x", // leave blank for native token transfers
			value: withdrawAmount,
			operation: OperationType.Call,
		};

		const options = {
			gasLimit,
			isSponsored: true,
		};

		console.log("DATA Prepared");

		const relayKit = new GelatoRelayPack(
			"JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_"
		);

		console.log("Gelato initialized");

		const safeTransaction = await safeSDK.createTransaction({
			safeTransactionData,
		});

		console.log("transaction initialized");

		const signedSafeTx = await safeSDK.signTransaction(safeTransaction);

		console.log("transaction signed");

		const safeSingletonContract = await getSafeContract({
			ethAdapter: ethAdapter,
			safeVersion: await safeSDK.getContractVersion(),
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
			signedSafeTx.encodedSignatures(),
		]);

		console.log("tx encoded");

		const relayTransaction = {
			target: safeAddress,
			encodedTransaction: encodedTx,
			chainId: 5, // GOERLI
			options,
		};

		console.log("relay sent");
		const response = await relayKit.relayTransaction(relayTransaction);

		console.log(
			`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
		);
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
					</div>
					{userAddress && (
						<div className="flex items-center justify-between mt-5">
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
