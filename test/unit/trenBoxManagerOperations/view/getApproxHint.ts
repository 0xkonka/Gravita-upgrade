import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetApproxHint(): void {
  context("when execute with trenBox owners count", function () {
    it("returns array with zeros", async function () {
      const { wETH } = this.collaterals.active;
      const CR = 2n;
      const numTrials = 1n;
      const inputRandomSeed = 2n;

      const tx = await this.contracts.trenBoxManagerOperations.getApproxHint(
        wETH.address,
        CR,
        numTrials,
        inputRandomSeed
      );

      expect(tx[0]).to.be.equal(ethers.ZeroAddress);
      expect(tx[1]).to.be.equal(0n);
      expect(tx[2]).to.be.equal(inputRandomSeed);
    });
  });

  context("when execute with open trenBoxes in the system", function () {
    beforeEach(async function () {
      this.user = [this.signers.accounts[1], this.signers.accounts[2]];
      const { erc20 } = this.testContracts;

      const assetAmount = ethers.parseUnits("100", 30);

      await this.utils.setupCollateralForTests({
        collateral: erc20,
        collateralOptions: {
          setAsActive: true,
          price: ethers.parseUnits("200", "ether"),
          mints: [
            {
              to: this.user[0].address,
              amount: ethers.parseUnits("100", 30),
            },
            {
              to: this.user[1].address,
              amount: ethers.parseUnits("100", 30),
            },
          ],
        },
      });

      const mintCap = ethers.parseUnits("200", 35);
      await this.contracts.adminContract.setMintCap(erc20, mintCap);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.user[0],
      });

      await (await openTrenBoxTx).wait();
    });

    it("should return correct values", async function () {
      const CR = 2n;
      const numTrials = 1n;
      const inputRandomSeed = 2n;
      const { erc20 } = this.testContracts;
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.user[1],
      });

      await (await openTrenBoxTx).wait();

      const tx = await this.contracts.trenBoxManagerOperations.getApproxHint(
        erc20,
        CR,
        numTrials,
        inputRandomSeed
      );

      expect(tx[0]).to.be.equal(this.user[0].address);
      expect(tx[1]).to.be.equal(4999999999999999999999999999998n);
      expect(tx[2]).to.not.be.equal(0);
    });
  });
}
