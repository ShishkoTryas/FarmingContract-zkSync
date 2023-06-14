const { expect } = require("chai");
const { ethers } = require("hardhat");

let farmingContract;
let tokenA;
let tokenB;
let owner;
let user1;
let user2;

beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const TokenA = await ethers.getContractFactory("MyTokenA");
    tokenA = await TokenA.deploy();
    await tokenA.deployed();

    const TokenB = await ethers.getContractFactory("MyTokenB");
    tokenB = await TokenB.deploy();
    await tokenB.deployed();

    const Farming = await ethers.getContractFactory("Farming");
    farmingContract = await Farming.deploy(tokenA.address, tokenB.address, 1);
    await farmingContract.deployed();

    await tokenB.connect(owner).transfer(user1.address, 5000);
    await tokenB.connect(owner).transfer(user2.address, 5000);
    await tokenA.connect(owner).approve(farmingContract.address, 20000);
    await tokenB.connect(owner).approve(farmingContract.address, 20000);
    await tokenB.connect(user1).approve(farmingContract.address, 5000);
    await tokenB.connect(user2).approve(farmingContract.address, 5000);

});

// Тесты
describe("Farming", function () {
    it("should deposit token B and update rewards correctly", async function () {

        const depositAmount = 500;

        await farmingContract.connect(user1).depositTokenB(depositAmount);

        expect(await farmingContract.balanceOf(user1.address)).to.equal(depositAmount);

        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(depositAmount);

        const earnedRewards = await farmingContract.earned(user1.address);
        expect(earnedRewards).to.equal(0);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedRewards = await farmingContract.earned(user1.address);
        expect(updatedRewards).to.equal(await farmingContract.rewards(user1.address));
    });

    it("should allow the admin to deposit token A", async function () {
        const depositAmount = 1000;

        await farmingContract.connect(owner).depositTokenA(depositAmount);

        const tokenABalance = await tokenA.balanceOf(farmingContract.address);
        expect(tokenABalance).to.equal(depositAmount);
    });

    it("should allow user to withdraw their deposits and rewards", async function () {
        const depositAmount = 500;
        await farmingContract.connect(owner).depositTokenA(5000);

        await farmingContract.connect(user1).depositTokenB(depositAmount);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await farmingContract.connect(user1).withdraw(depositAmount);

        const userBalance = await farmingContract.balanceOf(user1.address);
        expect(userBalance).to.equal(0);

        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(0);

        const earnedRewards = await farmingContract.earned(user1.address);
        expect(earnedRewards).to.equal(0);
    });

    it("should allow users to deposit token B", async function () {
        const depositAmount = 1000;

        await farmingContract.connect(user1).depositTokenB(depositAmount);

        const user1Balance = await farmingContract.balanceOf(user1.address);
        expect(user1Balance).to.equal(depositAmount);

        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(depositAmount);

        await farmingContract.connect(user2).depositTokenB(depositAmount);

        const user2Balance = await farmingContract.balanceOf(user2.address);
        expect(user2Balance).to.equal(depositAmount);

        const updatedTotalDeposits = await farmingContract.totalDeposits();
        expect(updatedTotalDeposits).to.equal(depositAmount * 2);
    });
});