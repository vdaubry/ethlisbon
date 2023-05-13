const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  const chainId = network.config.chainId;

  /***********************************
   *
   * Deploy smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy contract with owner : ${deployer}`);

  const CONTRACT_NAME = "Pay";

  const usdcTokenAddress = networkConfig[chainId].usdcToken;
  const arguments = [usdcTokenAddress];
  await deploy(CONTRACT_NAME, {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
    /* adjust if ProviderError: transaction underpriced */
    // gasPrice: ethers.utils.parseUnits("200", "gwei"),
    // gasLimit: 500000,
  });
  const contract = await ethers.getContract(CONTRACT_NAME);

  log("---------------------------------");
  log(`Contract deployed with owner : ${deployer}`);

  /***********************************
   *
   * Verify the deployment
   *
   ************************************/
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(contract.address, arguments);
  }
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "contract"];
