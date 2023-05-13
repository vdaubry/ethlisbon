// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Slice {
    mapping(address => address) eoaToSafe;

    function setSafe(address safe) public {
        eoaToSafe[msg.sender] = safe;
    }

    function getSafe() public view returns (address) {
        return eoaToSafe[msg.sender];
    }
}
