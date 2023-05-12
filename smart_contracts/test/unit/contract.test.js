const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
} else {
  describe("Contract", () => {
    let deployer;

    const CONTRACT_NAME = "MyToken";

    beforeEach(async () => {
      await deployments.fixture(["all"]);
      deployer = (await getNamedAccounts()).deployer;

      contract = await ethers.getContract(CONTRACT_NAME, deployer);
    });

    describe("constructor", async () => {
      const expectedTotalSupply = ethers.utils.parseUnits(
        (150 * 10 ** 9).toString(),
        18
      ); // 150 billion (18 decimals)

      it("should update total supply", async () => {
        const totalSupply = await contract.totalSupply();
        expect(totalSupply).to.equal(expectedTotalSupply);
      });

      it("should update name", async () => {
        const name = await contract.name();
        expect(name).to.equal("My Token");
      });

      it("should update symbol", async () => {
        const symbol = await contract.symbol();
        expect(symbol).to.equal("MYT");
      });
    });
  });
}
