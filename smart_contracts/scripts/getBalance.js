const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
require("dotenv").config();

async function main() {
  await getBalance();
}

async function getBalance() {
  const { deployer } = await getNamedAccounts();

  console.log(`Deployer: ${deployer}`);

  const contract = await ethers.getContract("MyToken", deployer);

  console.log(`Contract address: ${vestingToken.address}`);

  const balance = await contract.balanceOf(deployer);
  console.log(`Got ${balance.toString()} tokens`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
