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
	predictSafeAddress,
	getProxyFactoryContract,
	encodeCreateProxyWithNonce,
	encodeSetupCallData,
	encodeMultiSendData,
	getMultiSendCallOnlyContract,
} from "@safe-global/protocol-kit";
import {
	SafeAuthKit,
	SafeAuthSignInData,
	Web3AuthModalPack,
	Web3AuthEventListener,
} from "@/utils/safe-core/index";
import { OperationType, SafeVersion } from "@safe-global/safe-core-sdk-types";
import getSafeAuth from "@/utils/safeAuth";
import { useGenericContext } from "@/contexts/GenericContext";

const Web3Auth = () => {
	const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
		useState<SafeAuthSignInData | null>(null);
	const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>();
	const [userAddress, setUserAddress] = useState<string | null>(null);

	const safeVersion: SafeVersion = "1.3.0";

	// Shared state
	const { safeAddress, setSafeAddress } = useGenericContext();

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

		const PREDETERMINED_SALT_NONCE =
			"0xb1073742015cbcf5a3a4d9d1ae33ecf619439710b89475f92e2abd2117e90f90";

		const safeDeploymentConfig = {
			saltNonce: PREDETERMINED_SALT_NONCE,
			safeVersion: safeVersion,
		};

		const safeProxyFactoryContract = await getProxyFactoryContract({
			ethAdapter,
			safeVersion,
		});

		console.log("getProxyFactoryContract: ", safeProxyFactoryContract);

		const safeAddress = await predictSafeAddress({
			ethAdapter: ethAdapter,
			safeAccountConfig,
			safeDeploymentConfig,
		});

		console.log("predictSafeAddres: ", safeAddress);

		const safeContract = await getSafeContract({
			ethAdapter: ethAdapter,
			safeVersion: safeVersion,
		});

		console.log("getSafeContract: ", safeContract);

		const relayPack = new GelatoRelayPack(
			"JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_"
		);

		const initializer = await encodeSetupCallData({
			ethAdapter: ethAdapter,
			safeContract: safeContract,
			safeAccountConfig: safeAccountConfig,
		});

		console.log("encodeSetupCallData: ", initializer);

		const safeDeploymentTransaction = {
			to: safeProxyFactoryContract.getAddress(),
			value: "0",
			data: encodeCreateProxyWithNonce(
				safeProxyFactoryContract,
				safeContract.getAddress(),
				initializer
			),
			operation: OperationType.Call,
		};

		console.log(
			"safeDeploymentTransaction.encode: ",
			safeDeploymentTransaction
		);

		const multiSendData = encodeMultiSendData([safeDeploymentTransaction]);
		console.log("multiSendData: ", multiSendData);

		const multiSendCallOnlyContract = await getMultiSendCallOnlyContract({
			ethAdapter: ethAdapter,
			safeVersion,
		});
		console.log("multiSendCallOnlyContract: ", multiSendCallOnlyContract);

		const encodedTransaction = multiSendCallOnlyContract.encode("multiSend", [
			multiSendData,
		]);
		console.log("encodedTransaction: ", encodedTransaction);

		const chainId = await ethAdapter.getChainId();
		const relayTransaction = {
			target: await safeContract.getAddress(),
			encodedTransaction: encodedTransaction,
			chainId,
			options: {
				gasLimit: "100000",
				isSponsored: true,
			},
		};
		const response1 = await relayPack.relayTransaction(relayTransaction);
		console.log(
			`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response1.taskId}`
		);

		setSafeAddress(safeAddress);
		return response1.taskId;
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
