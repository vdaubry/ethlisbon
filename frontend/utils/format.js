import { ethers } from "ethers";

export const truncatedAmount = (
  amount,
  tokenDecimals = 18,
  formatDecimals = 2
) => {
  if (!amount) {
    return 0;
  }
  const formatedAmount = ethers.utils.formatUnits(
    amount.toString(),
    tokenDecimals
  );
  return (
    Math.round(formatedAmount * 10 ** formatDecimals) / 10 ** formatDecimals
  );
};

export const formatDate = (date) => {
  return new Date(date * 1000).toLocaleDateString();
};

export const truncatedAmount2 = (
  amount,
  tokenDecimals = 18,
  formatDecimals = 2
) => {
  if (!amount) {
    return 0;
  }
  const formatedAmount = ethers.utils.formatUnits(
    amount.toString(),
    tokenDecimals
  );
  return (
    Math.round(formatedAmount * 10 ** formatDecimals) / 10 ** formatDecimals
  );
};
