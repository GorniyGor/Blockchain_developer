const {
  FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { DEVS_NFT_CONTRACT_ADDRESS, DEVS_NFT_CONTRACT_ABI } = require("../constants");
require("dotenv").config({ path: ".env" });

async function main() {

  // Create a Infura WebSocket Provider
  const provider = new ethers.providers.WebSocketProvider(
    process.env.WS_PROVIDER_HTTP_URL,
    "goerli"
  );

  // Wrap your private key in the ethers Wallet class
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const MyBoysDevsNFTContract = new ethers.Contract(
        DEVS_NFT_CONTRACT_ADDRESS,
        DEVS_NFT_CONTRACT_ABI,
        signer
      );

  // Create a Flashbots Provider which will forward the request to the relayer
  // Which will further send it to the flashbot miner
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    signer,
    // URL for the flashbots relayer
    "https://relay-goerli.flashbots.net",
    "goerli"
  );

  provider.on("block", async (blockNumber) => {
    console.log("Block Number: ", blockNumber);
    // Send a bundle of transactions to the flashbot relayer
    const bundleResponse = await flashbotsProvider.sendBundle(
      [
        {
          transaction: {
            // ChainId for the Goerli network
            chainId: 5,
            // EIP-1559
            type: 2,
            // Value of 1 MyBoysDevsNFT
            value: ethers.utils.parseEther("0.01"),
            // Address of the MyBoysDevsNFT
            to: MyBoysDevsNFTContract.address,
            // In the data field, we pass the function selctor of the mint function
            data: MyBoysDevsNFTContract.interface.getSighash("mint()"),
            // Max Gas Fes you are willing to pay
            maxFeePerGas: BigNumber.from(10).pow(10).mul(7),
            // Max Priority gas fees you are willing to pay
            maxPriorityFeePerGas: BigNumber.from(10).pow(10).mul(2),
          },
          signer: signer,
        },
      ],
      blockNumber + 1
    );

    // If an error is present, log it
    if ("error" in bundleResponse) {
      console.log(bundleResponse.error.message);
    }
  });
}

main();