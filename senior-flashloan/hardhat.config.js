require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const PROVIDER_POLYGON_MAINNET_URL = process.env.PROVIDER_POLYGON_MAINNET_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
      hardhat:{
        forking: {
            url: PROVIDER_POLYGON_MAINNET_URL,
        },
      },
    },
};
