// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");

async function main() {
  const Contract = await hre.ethers.getContractFactory("RandomWinnerGame");
  const contract = await Contract.deploy(VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE);

  await contract.deployed();

  console.log(`Contract address: ${contract.address}`);

  // Wait for etherscan to notice that the contract has been deployed
  await new Promise((resolve) => setTimeout(resolve, 40000));

  // Verify the contract after deploying
  await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE],
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
