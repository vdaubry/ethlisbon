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
			const safeAuthKit = await getSafeAuth();

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
		setSafeAuthSignInResponse(response);
		setProvider(safeAuth.getProvider() as SafeEventEmitterProvider);
		setUserAddress(response.eoa);
	};

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
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Web3Auth;
