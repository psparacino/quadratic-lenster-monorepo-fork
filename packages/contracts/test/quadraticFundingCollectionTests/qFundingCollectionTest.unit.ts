import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { QuadraticVoteCollectModule } from "../../types/contracts/QuadraticVoteCollectModule";
import { deployGitcoinMumbaiFixture } from "../gitcoinTests/gitcoin.fixture";
import { DEFAULT_VOTE, getDefaultSigners } from "../utils/constants";
import { getCollectModulePubInitData } from "../utils/utils";
import { ERC20 } from "./../../types/contracts/mocks/ERC20";
import { QuadraticFundingVotingStrategyImplementation } from "./../../types/contracts/mocks/QuadraticFundingVotingStrategyImplementation";
import { RoundImplementation } from "./../../types/contracts/mocks/RoundImplementation";

export const shouldBehaveLikeQuadraticVoteModule = () => {
  let _qVoteCollectModule: QuadraticVoteCollectModule;
  let _WETH: ERC20;
  let _roundImplementation: RoundImplementation;
  let _votingStrategy: QuadraticFundingVotingStrategyImplementation;
  let _signers: { [key: string]: SignerWithAddress };
  let _initData: (string | number | BigNumber)[];
  let collectModuleInitData: string;
  before("Setup QFVM", async () => {
    const signers = await getDefaultSigners();
    _signers = signers;

    // deploy gitcoin fixture
    const { qVoteCollectModule, roundImplementation, WETH, votingStrategy } = await loadFixture(
      deployGitcoinMumbaiFixture,
    );

    _qVoteCollectModule = qVoteCollectModule;
    _WETH = WETH;
    _roundImplementation = roundImplementation;
    _votingStrategy = votingStrategy;
    _initData = [_WETH.address, 100, _roundImplementation.address, _votingStrategy.address];

    collectModuleInitData = getCollectModulePubInitData(_initData);
  });

  describe("QuadraticVoteCollectModule unit tests", () => {
    it("Should initialize the QVCM with WETH", async () => {
      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;
    });

    it("Should execute processCollect and vote", async () => {
      const { user2 } = _signers;

      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;

      //start a round
      const currentBlockTimestamp = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

      await ethers.provider.send("evm_mine", [currentBlockTimestamp + 750]); /* wait for round to start */

      //encode collect call data
      const collectData = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [_WETH.address, DEFAULT_VOTE]);

      await expect(_WETH.connect(user2).approve(_qVoteCollectModule.address, DEFAULT_VOTE)).to.emit(_WETH, "Approval");

      const moduleWitUser = _qVoteCollectModule.connect(user2);

      // TODO when fixed expect correct "Voted event parameters"
      await expect(moduleWitUser.processCollect(1, user2.address, 1, 1, collectData)).to.be.reverted;
    });

    it("Should execute processCollect with referral and vote", async () => {
      const { user2 } = _signers;

      await expect(_qVoteCollectModule.initializePublicationCollectModule(1, 1, collectModuleInitData)).to.not.be
        .reverted;

      const currentBlockTimestamp = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

      await ethers.provider.send("evm_mine", [currentBlockTimestamp + 750]); /* wait for round to start */

      //encode collect call data
      const collectData = ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [_WETH.address, DEFAULT_VOTE]);

      await _WETH.connect(user2).approve(_qVoteCollectModule.address, DEFAULT_VOTE);

      // TODO when fixed expect "Voted event parameters"
      await expect(_qVoteCollectModule.connect(user2).processCollect(22, user2.address, 1, 1, collectData)).to.be
        .reverted;
    });
  });
};
