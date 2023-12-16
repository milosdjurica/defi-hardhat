import { ethers, getNamedAccounts, network } from "hardhat";
import { IWeth } from "../typechain-types";
import { networkConfig } from "../utils/helper.config";

export const AMOUNT = ethers.parseEther("0.02");

export const getWeth = async () => {
	const deployerAddress = (await getNamedAccounts()).deployer;
	const deployer = await ethers.getSigner(deployerAddress);

	const iWeth: IWeth = await ethers.getContractAt(
		"IWeth",
		networkConfig[network.config.chainId!].wethToken!,
		deployer,
	);

	const tx = await iWeth.deposit({ value: AMOUNT });
	await tx.wait(1);

	const wethBalance = await iWeth.balanceOf(deployerAddress);
	console.log(`Get ${wethBalance} WETH`);
};
