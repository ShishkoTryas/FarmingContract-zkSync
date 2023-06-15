import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-toolbox";

let farmingContract: any;
let tokenA: any;
let tokenB: any;
let owner: any;
let user1: any;
let user2: any;
let deployer: any;


async function waitFor(conditionFn: () => Promise<boolean>, interval = 1000, timeout = 40000): Promise<void> {
    const startTime = Date.now();
    while (true) {
        if (await conditionFn()) {
            return;
        }
        if (Date.now() - startTime > timeout) {
            throw new Error(`waitFor timeout exceeded: ${timeout}ms`);
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}

beforeEach(async () => {
    const provider = Provider.getDefaultProvider();

    owner = new Wallet("0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110", provider);
    user1 = new Wallet("0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3", provider);
    user2 = new Wallet("0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e", provider);
    deployer = new Deployer(hre, owner);

    const erc20TokenAArtifact = await deployer.loadArtifact("MyTokenA");
    tokenA = await deployer.deploy(erc20TokenAArtifact);
    console.log(`TokenA address: ${tokenA.address}`);

    const erc20TokenBArtifact = await deployer.loadArtifact("MyTokenB");
    tokenB = await deployer.deploy(erc20TokenBArtifact);
    console.log(`TokenB address: ${tokenB.address}`);

    const farmArtifact = await deployer.loadArtifact("Farming");
    farmingContract = await deployer.deploy(farmArtifact, [tokenA.address, tokenB.address, 1]);
    console.log(`Farm address: ${farmingContract.address}`);
    console.log(`owner address: ${owner.address}`);

    await tokenB.connect(owner).transfer(user1.address, 5000);
    await tokenB.connect(owner).transfer(user2.address, 5000);

    await waitFor(async () => {
        return (await tokenB.balanceOf(user2.address)) > 0;
    });

    await tokenA.connect(owner).approve(farmingContract.address, 20000);
    await tokenB.connect(owner).approve(farmingContract.address, 20000);
    await tokenB.connect(user1).approve(farmingContract.address, 5000);
    await tokenB.connect(user2).approve(farmingContract.address, 5000);

    await waitFor(async () => {
        return (await tokenB.allowance(user2.address,farmingContract.address)) == 5000;
    });
});
describe("Farming", function () {
    it("should deposit token B and update rewards correctly", async function () {
        const depositAmount = 500;

        await farmingContract.connect(user1).depositTokenB(depositAmount);

        await waitFor(async () => {
            return (await farmingContract.balanceOf(user1.address)) == 500;
        });
        console.log(`Balance user1: ${await farmingContract.balanceOf(user1.address)}`);

        expect(await farmingContract.balanceOf(user1.address)).to.equal(depositAmount);

        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(depositAmount);

        console.log(`Contact balance: ${await farmingContract.balanceOf(user1.address)}`);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedRewards = await farmingContract.earned(user1.address);
        expect(updatedRewards).to.be.above(0);

        console.log(`earning balance: ${await farmingContract.earned(user1.address)}`);
    });

    it("should allow the admin to deposit token A", async function () {
        const depositAmount = 1000;

        await farmingContract.connect(owner).depositTokenA(depositAmount);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const tokenABalance = await tokenA.balanceOf(farmingContract.address);
        expect(tokenABalance).to.equal(depositAmount);
        console.log(`tokenA balance: ${tokenABalance}`);
    });

    it("should allow user to withdraw their deposits and rewards", async function () {
        const depositAmount = 500;
        await farmingContract.connect(owner).depositTokenA(5000);
        await farmingContract.connect(user1).depositTokenB(depositAmount);
        await waitFor(async () => {
            return (await tokenB.balanceOf(farmingContract.address)) > 0;
        });
        await farmingContract.connect(user1).withdraw(depositAmount);
        await waitFor(async () => {
            return (await farmingContract.balanceOf(user1.address)) == 0;
        });
        const userBalance = await farmingContract.balanceOf(user1.address);
        expect(userBalance).to.equal(0);
        await waitFor(async () => {
            return (await farmingContract.balanceOf(user1.address)) == 0;
        });
        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(0);
        await waitFor(async () => {
            return (await farmingContract.totalDeposits()) == 0;
        });
        const earnedRewards = await farmingContract.earned(user1.address);
        expect(earnedRewards).to.equal(0);
        await waitFor(async () => {
            return (await farmingContract.earned(user1.address)) == 0;
        });
    });

    it("should allow users to deposit token B", async function () {
        const depositAmount = 1000;

        await farmingContract.connect(user1).depositTokenB(depositAmount);

        await waitFor(async () => {
            return (await farmingContract.balanceOf(user1.address)) > 0;
        });

        const user1Balance = await farmingContract.balanceOf(user1.address);
        expect(user1Balance).to.equal(depositAmount);

        const totalDeposits = await farmingContract.totalDeposits();
        expect(totalDeposits).to.equal(depositAmount);

        await waitFor(async () => {
            return (await farmingContract.totalDeposits()) == depositAmount;
        });

        await farmingContract.connect(user2).depositTokenB(depositAmount);

        await waitFor(async () => {
            return (await farmingContract.balanceOf(user2.address)) > 0;
        });

        const user2Balance = await farmingContract.balanceOf(user2.address);
        expect(user2Balance).to.equal(depositAmount);

        const updatedTotalDeposits = await farmingContract.totalDeposits();
        expect(updatedTotalDeposits).to.equal(depositAmount * 2);

        await waitFor(async () => {
            return (await farmingContract.totalDeposits()) == depositAmount * 2;
        });

    });
});