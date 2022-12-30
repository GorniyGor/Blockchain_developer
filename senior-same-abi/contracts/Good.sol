//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Helper.sol";

contract Good {
    Helper helper;

    constructor(address _helper) {
        helper = Helper(_helper);
    }

    /**
    * @dev But should be so to eliminate the vulnerability
    */
//    constructor() payable {
//        helper = Helper();
//    }

    function isUserEligible() public view returns(bool) {
        return helper.isUserEligible(msg.sender);
    }

    function addUserToList() public  {
        helper.setUserEligible(msg.sender);
    }

}