const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("ERC721 Upgradeable", function () {
  it("Should deploy an upgradeable ERC721 Contract", async function () {
      const contractV1 = await ethers.getContractFactory("MyBoysDevNFT");
      const contractV2 = await ethers.getContractFactory("MyBoysDev2NFT");

      let proxyContract = await upgrades.deployProxy(contractV1, {
        kind: "uups",
      });
      const [owner] = await ethers.getSigners();
      const ownerOfToken1 = await proxyContract.ownerOf(1);

      expect(ownerOfToken1).to.equal(owner.address);

      proxyContract = await upgrades.upgradeProxy(proxyContract, contractV2);
      expect(await proxyContract.test()).to.equal("upgraded");
    });
});