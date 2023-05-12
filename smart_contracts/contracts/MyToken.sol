// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20PresetMinterPauser, Ownable {
    constructor(
        address owner,
        uint256 amount
    ) ERC20PresetMinterPauser("My Token", "MYT") {
        _mint(owner, amount);
    }
}
