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
        const safeAddress = "0x355bF8c2080B994c0409c45292e1b328bE82A242";
        await contract.setSafe(safeAddress, deployer);
        expect(await contract.getSafe(deployer)).to.equal(safeAddress);
      });
    });
  });
}
