require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const GOERLY_RPC_URL = process.env.GOERLY_RPC_URL
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.6.6",
  networks: {
    rinkeby: {
      url: `${RINKEBY_RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 4
    },
    goerly: {
      url: `${GOERLY_RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5
    }
  }
};
