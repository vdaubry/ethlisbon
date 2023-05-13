const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
} else {
  describe("Contract", () => {
    let deployer;

    const CONTRACT_NAME = "Slice";

    beforeEach(async () => {
      await deployments.fixture(["all"]);
      deployer = (await getNamedAccounts()).deployer;

      contract = await ethers.getContract(CONTRACT_NAME, deployer);
    });

    describe("setSafe", async () => {
      it("should set safe", async () => {
        const safeAddress = "0xCe2289B87b80457AC7f07352b25D2576BD6D88D8";
        await contract.setSafe(safeAddress);
        expect(await contract.getSafe()).to.equal(safeAddress);
      });
    });
  });
}
