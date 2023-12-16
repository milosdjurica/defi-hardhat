import { ethers, getNamedAccounts, network } from "hardhat";
import {
	IERC20,
	ILendingPool,
	ILendingPoolAddressesProvider,
} from "../typechain-types";

import { getWeth, AMOUNT } from "./getWeth";
import { networkConfig } from "../utils/helper.config";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
	await getWeth();
	const deployerAddress = (await getNamedAccounts()).deployer;
	const deployer = await ethers.getSigner(deployerAddress);

	const lendingPool = await getLendingPool(deployer);
	console.log("lendingPool address -> ", await lendingPool.getAddress());

	const wethTokenAddress = networkConfig[network.config.chainId!].wethToken!;
	console.log("Approving...");
	await approveERC20(
		wethTokenAddress,
		await lendingPool.getAddress(),
		AMOUNT,
		deployer,
	);

	console.log("Depositing......");
	await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
	console.log("Deposited !!!");
}

async function approveERC20(
	erc20Address: string,
	spenderAddress: string,
	amount: bigint,
	account: HardhatEthersSigner,
) {
	const erc20Token: IERC20 = await ethers.getContractAt(
		"IERC20",
		erc20Address,
		account,
	);

	const tx = await erc20Token.approve(spenderAddress, amount);
	await tx.wait(1);
	console.log("Approved");
}

async function getLendingPool(deployer: HardhatEthersSigner) {
	const lendingPoolAddressesProvider: ILendingPoolAddressesProvider =
		await ethers.getContractAt(
			"ILendingPoolAddressesProvider",
			networkConfig[network.config.chainId!].lendingPoolAddressesProvider!,
			deployer,
		);

	const lendingPoolAddress =
		await lendingPoolAddressesProvider.getLendingPool();

	const lendingPool: ILendingPool = await ethers.getContractAt(
		"ILendingPool",
		lendingPoolAddress,
		deployer,
	);
	return lendingPool;
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log("error", error);
		process.exit(1);
	});
