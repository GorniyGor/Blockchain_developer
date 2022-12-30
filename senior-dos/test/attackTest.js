const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Attack", function () {
  it("After being declared the winner, Attacker should not allow anyone else to become the winner", async function () {
      // Deploy the good contract
      const goodContract = await ethers.getContractFactory("Good");
      const _goodContract = await goodContract.deploy();
      await _goodContract.deployed();

      // Deploy the Attack contract
      const attackContract = await ethers.getContractFactory("Attack");
      const _attackContract = await attackContract.deploy(_goodContract.address);

      // Now lets attack the good contract
      // Get two addresses
      const [_, addr1, addr2] = await ethers.getSigners();

      // Initially let addr1 become the current winner of the aution
      let tx = await _goodContract.connect(addr1).setCurrentAuctionPrice({
        value: parseEther("1"),
      });
      await tx.wait();

      // Start the attack and make Attack.sol the current winner of the auction
      tx = await _attackContract.attack({
        value: parseEther("3.0"),
      });
      await tx.wait();

      // Now lets trying making addr2 the current winner of the auction
      tx = await _goodContract.connect(addr2).setCurrentAuctionPrice({
        value: parseEther("4"),
      });
      await tx.wait();

      // Now lets check if the current winner is still attack contract
      expect(await _goodContract.currentWinner()).to.equal(
        _attackContract.address
      );
    });

    it("After being declared the winner, Attacker allow anyone else to become the winner", async function () {
          // Deploy the good contract
          const goodContract = await ethers.getContractFactory("GoodWithCorrection");
          const _goodContract = await goodContract.deploy();
          await _goodContract.deployed();

          // Deploy the Attack contract
          const attackContract = await ethers.getContractFactory("Attack");
          const _attackContract = await attackContract.deploy(_goodContract.address);

          // Now lets attack the good contract
          // Get two addresses
          const [_, addr1, addr2] = await ethers.getSigners();

          // Initially let addr1 become the current winner of the aution
          let tx = await _goodContract.connect(addr1).setCurrentAuctionPrice({
            value: parseEther("1"),
          });
          await tx.wait();

          // Start the attack and make Attack.sol the current winner of the auction
          tx = await _attackContract.attack({
            value: parseEther("3.0"),
          });
          await tx.wait();

          // Now lets trying making addr2 the current winner of the auction
          tx = await _goodContract.connect(addr2).setCurrentAuctionPrice({
            value: parseEther("4"),
          });
          await tx.wait();

          // Now lets check if the current winner is still attack contract
          expect(await _goodContract.currentWinner()).to.equal(
            addr2.address
          );
        });
});