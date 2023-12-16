import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

import "hardhat-deploy";
import "hardhat-deploy-ethers";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_PROCESS_ENV || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xKEY";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "api-key";
const POLYGONSCAN_API_KEY =
	process.env.POLYGONSCAN_API_KEY || "polygon-api-key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "api-key";

const config: HardhatUserConfig = {
	solidity: "0.8.20",
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			// blockConfirmations: 3
		},
		// for working with yarn hardhat node !
		localhost: {
			chainId: 31337,
			url: "http://127.0.0.1:8545",
			// automatically gets 10 default accounts
		},
		ganache: {
			chainId: 1337,
			url: "http://127.0.0.1:8545",
		},
		sepolia: {
			chainId: 11155111,
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		player: {
			default: 1,
		},
	},
	etherscan: {
		apiKey: {
			// mainnet: ETHERSCAN_API_KEY,
			sepolia: ETHERSCAN_API_KEY,
			// polygon: POLYGONSCAN_API_KEY,
		},
	},
	gasReporter: {
		// put it enabled: true -> only when you want to check gas optimizations
		enabled: false,
		noColors: true,
		outputFile: "gas-report.txt",
		currency: "USD",
		excludeContracts: [],
		coinmarketcap: COINMARKETCAP_API_KEY,
		// token: "MATIC", // polygon network
	},
	mocha: {
		timeout: 500000, //500 seconds
	},
};

export default config;
