"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADAPTER_EVENTS, SafeEventEmitterProvider } from "@web3auth/base";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import { ethers } from "ethers";
import Safe, {
	EthersAdapter,
	getSafeContract,
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
import { GenericCard } from "@/components/GenericCard";
import { useNetwork, useAccount, useContract, useSigner } from "wagmi";
import { contractAddresses, contractAbi } from "@/constants/index";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const CreateSafe = () => {
	const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
		useState<SafeAuthSignInData | null>(null);
	const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>();
	const [userAddress, setUserAddress] = useState<string | null>(null);
	const router = useRouter();

	const { chain } = useNetwork();
	const { address: account } = useAccount();

	// localState for Name + Phone number
	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const safeVersion: SafeVersion = "1.3.0";

	const setSafe = async (safeAddress) => {
		const CHAIN_ID = 5;
		const contractAddress = contractAddresses[CHAIN_ID]["contract"];

		const safeAuthKit = await getSafeAuth();
		const provider = new ethers.providers.Web3Provider(
			safeAuthKit.getProvider()
		);
		const signer = provider.getSigner();
		const signerAddress = await signer.getAddress();
		const contract = new ethers.Contract(contractAddress, contractAbi, signer);
		const { data } = await contract.populateTransaction.setSafe(
			safeAddress,
			signerAddress
		);

		const request = {
			chainId: CHAIN_ID,
			target: contractAddress,
			data: data,
			gasLimit: "100000",
			isSponsored: true,
			user: await signer.getAddress(),
		};

		const relayKit = new GelatoRelay();

		const response = await relayKit.sponsoredCall(
			request,
			"JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_"
		);

		console.log(
			`Set Safer in contract Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
		);
	};

	useEffect(() => {
		(async () => {
			const safeAuthKit = await getSafeAuth();

			const response = await safeAuthKit.signIn();
			setUserAddress(response.eoa);
			setSafeAuth(safeAuthKit);
		})();
	}, []);

	const createSafe = async () => {
		setIsLoading(true);
		const provider = new ethers.providers.Web3Provider(safeAuth.getProvider());
		const signer = provider.getSigner();

		const ethAdapter = new EthersAdapter({
			ethers,
			signerOrProvider: signer || provider,
		});

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

		const safeAddress_ = await predictSafeAddress({
			ethAdapter: ethAdapter,
			safeAccountConfig,
			safeDeploymentConfig,
		});

		const safeContract = await getSafeContract({
			ethAdapter: ethAdapter,
			safeVersion: safeVersion,
		});

		const relayPack = new GelatoRelayPack(
			"JcpsXW8SvuPmeHlMEwVgvW_JjzMiF8L72Qj17PQQ944_"
		);

		const initializer = await encodeSetupCallData({
			ethAdapter: ethAdapter,
			safeContract: safeContract,
			safeAccountConfig: safeAccountConfig,
		});

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

		const multiSendData = encodeMultiSendData([safeDeploymentTransaction]);
		const multiSendCallOnlyContract = await getMultiSendCallOnlyContract({
			ethAdapter: ethAdapter,
			safeVersion,
		});

		const encodedTransaction = multiSendCallOnlyContract.encode("multiSend", [
			multiSendData,
		]);

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

		await setSafe(safeAddress_);
		router.push("/verification");
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col items-center min-h-screen py-6 ">
			<main className="flex flex-col items-center flex-1 px-20 text-center">
				<Image
					src={"/logo.svg"}
					width={600}
					height={200}
					className={"-mb-20"}
					alt="logo"
				/>
				<div className="flex items-center justify-center text-left mt-3">
					<GenericCard
						className={""}
						title={"Set up your account"}
						subtitle={
							"During the registration we'll create a safe for you to safely receive your funds"
						}
						footerText={"Register"}
						footerClick={() => createSafe()}
						loadingFooterButton={isLoading}
					>
						<Label htmlFor="name-input" className="text-left">
							Name
						</Label>
						<Input
							type="text"
							placeholder="John Doe"
							id="name-input"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<Label htmlFor="phone-input" className="text-left">
							Phone Number
						</Label>
						<Input
							type="tel"
							id="phone-input"
							placeholder="+1 555 555 5555"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
						/>
						<p className="text-sm text-muted-foreground text-left">
							Make sure to include your country code.
						</p>
					</GenericCard>
				</div>
			</main>
		</div>
	);
};

export default CreateSafe;
