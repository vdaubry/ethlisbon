import { mainnet, polygon, arbitrum, hardhat, goerli } from "wagmi/chains";
import { getDefaultClient } from "connectkit";
import { createClient } from "wagmi";

const chains = [polygon, goerli, hardhat, mainnet, arbitrum];

export const client = createClient(
  getDefaultClient({
    autoConnect: true,
    appName: "AppName",
    chains,
  })
);
