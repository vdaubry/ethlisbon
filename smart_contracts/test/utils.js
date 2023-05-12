const increaseEvmTime = async (interval) => {
  await ethers.provider.send("evm_increaseTime", [interval.toNumber()]);
  await network.provider.send("evm_mine", []);
};

module.exports = { increaseEvmTime };
