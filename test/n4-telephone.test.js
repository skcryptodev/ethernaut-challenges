const {ethers} = require("hardhat")
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")

describe.only("Challenge 4 - Telephone", function() {

    async function deployContractsFixture() {
        const [deployer, maliciousUser] = await ethers.getSigners()

        const Telephone = await ethers.getContractFactory("Telephone")
        const vulnerableContract = await Telephone.deploy()
        await vulnerableContract.deployed()

        const N4Attacker = await ethers.getContractFactory("N4Attacker")
        const maliciousContract = await N4Attacker.connect(maliciousUser).deploy(vulnerableContract.address)
        maliciousContract.deployed()

        return {deployer, maliciousUser, vulnerableContract, maliciousContract}
    }

    describe("Initial State", function() {
        it("Should deploy contracts with correct deployers", async function() {
            const {deployer, maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)

            expect(vulnerableContract.deployTransaction.from).to.equal(deployer.address)
            expect(maliciousContract.deployTransaction.from).to.equal(maliciousUser.address)
        })

        it("Should set correct contract owner", async function() {
            const {deployer, maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)

            expect(await vulnerableContract.owner()).to.equal(deployer.address)
        })
    })

    describe("Attack Execution", function() {
        it("Should update contract owner", async function() {
            const {maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)

            await(await maliciousContract.connect(maliciousUser).attack()).wait()

            expect(await vulnerableContract.owner()).to.equal(maliciousUser.address)
        })
    })
})
