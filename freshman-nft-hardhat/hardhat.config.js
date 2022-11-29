require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const PROVIDER_HTTP_URL = process.env.PROVIDER_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
      goerli: {
        url: PROVIDER_HTTP_URL,
        accounts: [PRIVATE_KEY],
      },
    },
};
