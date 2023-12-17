import { ethers, getNamedAccounts, network } from "hardhat";
import {
	AggregatorV3Interface,
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

	let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
		lendingPool,
		deployer,
	);

	const daiPrice = await getDaiPrice();
	const amountDaiToBorrow =
		availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toString());

	console.log(`Can borrow -> ${amountDaiToBorrow} DAI`);

	const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString());

	console.log("amountDaiToBorrowWei", amountDaiToBorrowWei);
	const daiAddress = networkConfig[network.config.chainId!].daiToken;

	await borrowDai(
		daiAddress,
		lendingPool,
		amountDaiToBorrowWei.toString(),
		deployer,
	);

	await getBorrowUserData(lendingPool, deployer);
}

async function borrowDai(
	daiAddress: string,
	lendingPool: ILendingPool,
	amountDaiToBorrowWei: string,
	account: HardhatEthersSigner,
) {
	const borrowTx = await lendingPool.borrow(
		daiAddress,
		amountDaiToBorrowWei,
		2,
		0,
		account,
	);

	await borrowTx.wait(1);

	console.log("You have borrowed!");
}

async function getDaiPrice() {
	const daiEthPriceFeed: AggregatorV3Interface = await ethers.getContractAt(
		"AggregatorV3Interface",
		networkConfig[network.config!.chainId!].daiEthPriceFeed!,
		// ! Don't need to connect to deployer because we are only reading from this contract,
		// !and not sending transactions
	);

	const price = (await daiEthPriceFeed.latestRoundData()).answer;
	console.log("DAI/ETH price is -> ", price);
	return price;
}

async function getBorrowUserData(
	lendingPool: ILendingPool,
	account: HardhatEthersSigner,
): Promise<{ totalDebtETH: bigint; availableBorrowsETH: bigint }> {
	const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
		await lendingPool.getUserAccountData(account);

	console.log(`You have ${totalCollateralETH} worth of ETH deposited!`);
	console.log(`You have ${totalDebtETH} worth of ETH borrowed!`);
	console.log(`You can borrow  ${availableBorrowsETH} worth of ETH!`);
	return { totalDebtETH, availableBorrowsETH };
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
