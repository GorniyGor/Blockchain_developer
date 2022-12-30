const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Attack", function () {
  it("attacker will be able to change the owner of Good.sol", async function () {
      // Get one address
      const [_, addr1] = await ethers.getSigners();

      // Deploy the good contract
      const goodContract = await ethers.getContractFactory("Good");
      const _goodContract = await goodContract.connect(addr1).deploy();
      await _goodContract.deployed();

      // Deploy the Attack contract
      const attackContract = await ethers.getContractFactory("Attack");
      const _attackContract = await attackContract.deploy(_goodContract.address);

      let tx = await _attackContract.connect(addr1).attack();
      await tx.wait();

      // Now lets check if the current owner of Good.sol is actually Attacker
      expect(await _goodContract.owner()).to.equal(_attackContract.address);
    });

    it("attacker cannot change the owner of Good.sol", async function () {
          // Get one address
          const [_, addr1] = await ethers.getSigners();

          // Deploy the good contract
          const goodContract = await ethers.getContractFactory("Good");
          const _goodContract = await goodContract.connect(addr1).deploy();
          await _goodContract.deployed();

          // Deploy the Attack contract
          const attackContract = await ethers.getContractFactory("Attack");
          const _attackContract = await attackContract.deploy(_goodContract.address);

          // Now lets try change owner from non-owner address
          await expect(
            _attackContract.connect(addr1).attackOnCorrected()
          ).to.be.revertedWith("Not owner")
        });
});