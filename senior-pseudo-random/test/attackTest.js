const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

describe("Attack", function () {
  it("Should be able to guess the exact number", async function () {
      // Deploy the Game contract
      const Game = await ethers.getContractFactory("Game");
      const _game = await Game.deploy({ value: parseEther("0.1") });
      await _game.deployed();

      // Deploy the attack contract
      const Attack = await ethers.getContractFactory("Attack");
      const _attack = await Attack.deploy(_game.address);

      // Attack the Game contract
      const tx = await _attack.attack();
      await tx.wait();

      const balanceGame = await ethers.provider.getBalance(_game.address);
      const balanceAttacker = await ethers.provider.getBalance(_attack.address);

      expect(balanceGame).to.equal(parseEther("0"));
      expect(balanceAttacker).to.equal(parseEther("0.1"));
    });
});