// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;
  // const lockedAmount = hre.ethers.utils.parseEther("1");
  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  // await lock.deployed();
  // console.log("Lock with 1 ETH deployed to:", lock.address);

  const Fallback = await hre.ethers.getContractFactory("Fallback")
  const Attacker = await hre.ethers.getContractFactory("Attacker")

  const fallback = await Fallback.deploy()
  await fallback.deployed()
  console.log(`deployed Fallback contract to ${fallback.address}`)

  const attacker = await Attacker.deploy(fallback.address)
  await attacker.deployed()
  console.log(`deployed Attacker contract to ${attacker.address}
    with target address ${fallback.address}`)

  const [acct1, acct2, acct3] = await hre.ethers.getSigners()
  console.log(`
    ${acct1.address} ${hre.ethers.utils.formatEther(await acct1.getBalance())},
    ${acct2.address} ${hre.ethers.utils.formatEther(await acct2.getBalance())},
    ${acct3.address} ${hre.ethers.utils.formatEther(await acct3.getBalance())}
  `)
  console.log("sending funds to attacker")
  await acct1.sendTransaction({to:attacker.address, value:hre.ethers.utils.parseEther("10")})
  
  //expect(await fallback.contributions(attacker.address)).to.equal("0")

  console.log("contributing...")
  await attacker.contribute()
  const currentValue = await fallback.contributions(attacker.address)
  console.log(`done... ${currentValue}`)

  const currentValueAcct1 = await fallback.contributions(acct1.address)
  console.log(`done... ${attacker.address}:${hre.ethers.utils.formatEther(await attacker.balance())} ether`)
  console.log(`done... ${acct1.address}:${hre.ethers.utils.formatEther(currentValueAcct1)} ether`)
  console.log(`owner is ${await fallback.owner()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
