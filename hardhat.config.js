require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.6.6",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 3000
      }
    }
  }
};
