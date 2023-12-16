import { ethers, getNamedAccounts, network } from "hardhat";
import { getWeth } from "./getWeth";
import {
	ILendingPool,
	ILendingPoolAddressesProvider,
} from "../typechain-types";
import { networkConfig } from "../utils/helper.config";

async function main() {
	console.log("Aave");
	await getWeth();
	const { deployer } = await getNamedAccounts();
	const lendingPool: ILendingPool = await getLendingPool(deployer);
	console.log("lendingPool address -> ", await lendingPool.getAddress());
}

async function getLendingPool(deployerAddress: string) {
	const deployer = await ethers.getSigner(deployerAddress);
	const lendingPoolAddressesProvider: ILendingPoolAddressesProvider =
		await ethers.getContractAt(
			"ILendingPoolAddressesProvider",
			networkConfig[network.config.chainId!].lendingPoolAddressesProvider!,
			deployer,
		);

	const lendingPoolAddress =
		await lendingPoolAddressesProvider.getLendingPool();

	const lendingPool = await ethers.getContractAt(
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
