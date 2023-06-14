import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-toolbox";

export default async function (hre: HardhatRuntimeEnvironment) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

    const wallet = new Wallet(PRIVATE_KEY);
    const deployer = new Deployer(hre, wallet);

    const erc20TokenAArtifact = await deployer.loadArtifact("MyTokenA");
    const erc20tokenA = await deployer.deploy(erc20TokenAArtifact);
    console.log(`TokenA address: ${erc20tokenA.address}`);

    const erc20TokenBArtifact = await deployer.loadArtifact("MyTokenB");
    const erc20tokenB = await deployer.deploy(erc20TokenBArtifact);
    console.log(`TokenB address: ${erc20tokenB.address}`);


    const farmArtifact = await deployer.loadArtifact("Farming");
    const farm = await deployer.deploy(farmArtifact, [erc20tokenA.address, erc20tokenB.address, 2]);
    console.log(`Farm address: ${farm.address}`);


    console.log(`Done!`);

}