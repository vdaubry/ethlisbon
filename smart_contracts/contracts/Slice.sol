// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MyToken {
    mapping(address => address) eoaToSafe;

    function setSafe(address safe) public {
        eoaToSafe[msg.sender] = safe;
    }
}
