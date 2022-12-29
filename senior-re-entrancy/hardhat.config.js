require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const PROVIDER_HTTP_URL = process.env.PROVIDER_HTTP_URL;
const PROVIDER_MUMBAI_HTTP_URL = process.env.PROVIDER_MUMBAI_HTTP_URL;
const PROVIDER_POLYGON_MAINNET_URL = process.env.PROVIDER_POLYGON_MAINNET_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY;

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
