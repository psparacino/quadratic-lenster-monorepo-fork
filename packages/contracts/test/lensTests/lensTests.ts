
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeLensHubMumbai } from "./lensMumbai.behavior";
import { deployLensMumbaiFixture } from "./lens.fixture";

describe("Lens Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user = signers[2];
    this.loadFixture = loadFixture;
  });

  describe("Lens deployment", function () {
    beforeEach(async function () {
      const { lensMumbai, freeCollectModule } = await this.loadFixture(deployLensMumbaiFixture);
      this.lensMumbai = lensMumbai;
      this.freeCollectModule = freeCollectModule;

    });

  shouldBehaveLikeLensHubMumbai();

  })

});
