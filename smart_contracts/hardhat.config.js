require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // forking: {
      //   url: MAINNET_RPC_URL,
      //   blockNumber: 16232680,
      // },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 5,
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 137,
    },
    optimisticEthereum: {
      url: "https://mainnet.optimism.io",
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 10,
    },
    scrollAlphaTestnet: {
      url: "https://alpha-rpc.scroll.io/l2",
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 534353,
    },
    gnosisChain: {
      url: "https://rpc.gnosischain.com",
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 100,
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      polygon: "GRWRVBB9MGTWI599KUSPJNS5ZXW97MA3Z3",
      optimisticEthereum: "9CEXUK2XSCQ48E31P11QAHAIY376YXIHNF",
      gnosis: "X56R4A6ZHP2Y88U68XP6NZ3Q73Y233FD7R",
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      5: 0,
      31337: 0,
    },
    user: {
      default: 1,
    },
    user2: {
      default: 2,
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
