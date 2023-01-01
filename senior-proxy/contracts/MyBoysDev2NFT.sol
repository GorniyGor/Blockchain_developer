//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MyBoysDevNFT.sol";

contract MyBoysDev2NFT is MyBoysDevNFT {

    function test() pure public returns(string memory) {
        return "upgraded";
    }
}