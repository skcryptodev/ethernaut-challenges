const {ethers} = require("hardhat")
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")

describe("Challenge 3 - CoinFlip", function() {

    async function deployContractsFixture() {
        const [deployer, regularUser, maliciousUser] = await ethers.getSigners()

        const CoinFlip = await ethers.getContractFactory("CoinFlip")
        const vulnerableContract = await CoinFlip.deploy()
        await vulnerableContract.deployed()

        const N3Attacker = await ethers.getContractFactory("N3Attacker")
        const maliciousContract = await N3Attacker.connect(maliciousUser).deploy(vulnerableContract.address)
        await maliciousContract.deployed()

        return {deployer, maliciousUser, vulnerableContract, maliciousContract}
    }

    describe("Initial State", function() {
        it("Should deploy contracts with correct deployers", async function() {
            const {deployer, maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)

            expect(vulnerableContract.deployTransaction.from).to.equal(deployer.address)
            expect(maliciousContract.deployTransaction.from).to.equal(maliciousUser.address)
        })
    })

    describe("Attack Execution", function() {
        it("Should flip coin to guessed side every time", async function() {
            const {maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)
            const numsToSpin = 10;

            for(let i = 0; i < numsToSpin; i++) {
                await (await maliciousContract.connect(maliciousUser).flipForWin()).wait()
            }

            expect(await vulnerableContract.consecutiveWins()).to.equal(numsToSpin)
        })
    })
})