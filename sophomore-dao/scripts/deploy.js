// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { DEVS_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("FakeNFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.deployed();

  console.log(
    `FakeNFTMarketplace token address: ${marketplace.address}`
  );

  const Dao = await hre.ethers.getContractFactory("MyBoysDevsDAO");
  const dao = await Dao.deploy(marketplace.address, DEVS_NFT_CONTRACT_ADDRESS, { value: ethers.utils.parseEther("0.001") });

  await dao.deployed();

  console.log(
    `MyBoysDevsDAO token address: ${dao.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
