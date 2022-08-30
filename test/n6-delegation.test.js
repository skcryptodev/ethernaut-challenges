const {ethers} = require("hardhat")
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")

describe.only("Challenge 6 - Delegation", function() {

    async function deployContractsFixture() {
        const [deployer, maliciousUser] = await ethers.getSigners()

        const Delegate = await ethers.getContractFactory("Delegate")
        const delegateContract = await Delegate.deploy(deployer.address)
        await delegateContract.deployed()

        const Delegation = await ethers.getContractFactory("Delegation")
        const vulnerableContract = await Delegation.deploy(delegateContract.address)
        await vulnerableContract.deployed()

        const N6Attacker = await ethers.getContractFactory("N6Attacker")
        const maliciousContract = await N6Attacker.deploy(vulnerableContract.address)
        await maliciousContract.deployed()

        return {deployer, maliciousUser, vulnerableContract, maliciousContract}
    }

    describe("Initial State", function() {
        it("Should deploy contract with correct deployer", async function() {
            const {deployer, vulnerableContract} = await loadFixture(deployContractsFixture)

            expect(vulnerableContract.deployTransaction.from).to.equal(deployer.address)
            expect(await vulnerableContract.owner()).is.equal(deployer.address)
        })
    })

    describe("Attack Execution", function() {
        it("Should change owner", async function() {
            const {maliciousUser, vulnerableContract, maliciousContract} = await loadFixture(deployContractsFixture)
    
            const tx = await maliciousContract.connect(maliciousUser).attack()
            const tx_receipt = await tx.wait()

            console.log(tx_receipt)

            expect(await vulnerableContract.owner()).is.equal(maliciousContract.address)
        })
    })
})
