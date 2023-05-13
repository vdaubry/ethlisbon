// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pay  {
  // Stable coin address;
  address public _stable_address;
  constructor(address stable_address) {
    _stable_address = stable_address;
  }

  function transfer(address from, address to, uint256 amount) public returns (bool) {
    require(to != address(0), "transfer to the zero address");
    require(amount <= IERC20(_stable_address).balanceOf(from), "transfer amount exceeds balance");

    IERC20(_stable_address).transferFrom(from, to, amount);

    return true;
  }
}
