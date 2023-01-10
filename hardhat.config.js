require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  networks: {
    localhost: {
      url: `${RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 1337
    }
  }
};
