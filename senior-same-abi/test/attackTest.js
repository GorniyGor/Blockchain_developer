const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Attack", function () {
  it("Should change the owner of the Good contract", async function () {
      // Deploy the Attack contract instead of proper Helper.sol contract with the same ABI
      const attackContract = await ethers.getContractFactory("Attack");
      const _attackContract = await attackContract.deploy();
      await _attackContract.deployed();

      // Deploy the good contract
      const goodContract = await ethers.getContractFactory("Good");
      const _goodContract = await goodContract.deploy(_attackContract.address);

      const [_, addr1] = await ethers.getSigners();
      // Now lets add an address to the eligibility list
      let tx = await _goodContract.connect(addr1).addUserToList();
      await tx.wait();

      // check if the user is eligible
      const eligible = await _goodContract.connect(addr1).isUserEligible();
      expect(eligible).to.equal(false);
    });
});