const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
    usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  5: {
    name: "goerli",
    usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  137: {
    name: "polygon",
    usdcToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  },
  10: {
    name: "optimisticEthereum",
    usdcToken: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
  },
  534353: {
    name: "ScrollAlphaTestnet",
    usdcToken: "0x67aE69Fd63b4fc8809ADc224A9b82Be976039509",
  },
  100: {
    name: "gnosisChain",
    usdcToken: "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
  },
  59140: {
    name: "linea",
    usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
};
