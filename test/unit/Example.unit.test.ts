import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { developmentChains } from "../../utils/helper.config";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
	? describe.skip
	: describe("Example Unit Tests", () => {
			beforeEach(async () => {
				describe("Constructor Tests", () => {
					it("Example test", async () => {});
				});
			});
	  });
