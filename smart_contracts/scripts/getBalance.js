const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
require("dotenv").config();

async function main() {
  await getBalance();
}

async function getBalance() {
  const { deployer } = await getNamedAccounts();
  const contract = await ethers.getContract("MyToken", deployer);
  const balance = await contract.balanceOf(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
