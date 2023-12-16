import { ethers, getNamedAccounts } from "hardhat";
import { IWeth } from "../typechain-types";

const AMOUNT = ethers.parseEther("0.02");

export const getWeth = async () => {
	const deployerAddress = (await getNamedAccounts()).deployer;
	const deployer = await ethers.getSigner(deployerAddress);
	// 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
	console.log("Entered");
	const iWeth: IWeth = await ethers.getContractAt(
		"IWeth",
		"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
		deployer,
	);
	console.log("After");

	const tx = await iWeth.deposit({ value: AMOUNT });
	await tx.wait(1);
	console.log("Wait 1");

	const wethBalance = await iWeth.balanceOf(deployerAddress);
	console.log(`Deposited ${wethBalance} WETH`);
};
