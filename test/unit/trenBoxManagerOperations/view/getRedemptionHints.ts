import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetRedemptionHints(): void {
  context("when execute with no open any trenBox in the system", function () {
    it("returns array with zeros", async function () {
      const { wETH } = this.collaterals.active;
      const debtTokenAmount = 100n;
      const price = 100n;
      const maxIterations = 2n;

      const tx = await this.contracts.trenBoxManagerOperations.getRedemptionHints(
        wETH.address,
        debtTokenAmount,
        price,
        maxIterations
      );

      expect(tx).to.be.an("array").that.includes(ethers.ZeroAddress);
    });
  });

  context(
    "when execute with open trenBoxes in the system when netDebt equals minDebt",
    function () {
      beforeEach(async function () {
        const user = this.signers.accounts[0];
        const { erc20 } = this.testContracts;

        await this.utils.setupCollateralForTests({
          collateral: erc20,
          collateralOptions: {
            setAsActive: true,
            price: ethers.parseUnits("200", "ether"),
            mints: [
              {
                to: user.address,
                amount: ethers.parseUnits("100", 30),
              },
            ],
          },
        });

        this.user = user;
      });

      it("should return correct values", async function () {
        const debtTokenAmount = ethers.parseUnits("50", 30);
        const price = ethers.parseUnits("200", "ether");
        const maxIterations = 2n;
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);
        const mintCap = ethers.parseUnits("100", 35);

        await this.contracts.adminContract.setMintCap(assetAddress, mintCap);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: this.user,
        });

        await (await openTrenBoxTx).wait();

        const tx = await this.contracts.trenBoxManagerOperations.getRedemptionHints(
          erc20,
          debtTokenAmount,
          price,
          maxIterations
        );

        expect(tx[0]).to.be.equal(this.user.address);
        expect(tx[1]).to.be.equal(0);
        expect(tx[2]).to.not.be.equal(0);
      });
    }
  );

  context(
    "when execute with open trenBoxes in the system when netDebt bigger than minDebt",
    function () {
      beforeEach(async function () {
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("1", 30);
        const mintCap = ethers.parseUnits("100", 35);

        this.user = [this.signers.accounts[0], this.signers.accounts[1]];

        await this.contracts.adminContract.setMintCap(assetAddress, mintCap);

        await this.utils.setupCollateralForTests({
          collateral: erc20,
          collateralOptions: {
            setAsActive: true,
            price: ethers.parseUnits("20", "ether"),
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

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: this.user[0],
        });

        await (await openTrenBoxTx).wait();
      });

      it("should return correct values", async function () {
        const debtTokenAmount = ethers.parseUnits("5", 21);
        const price = ethers.parseUnits("200", "ether");
        const maxIterations = 2n;
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);
        const mintCap = ethers.parseUnits("100", 35);

        await this.contracts.adminContract.setMintCap(assetAddress, mintCap);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: this.user[1],
          extraDebtTokenAmount: ethers.parseUnits("2000", "ether"),
        });

        await (await openTrenBoxTx).wait();

        const tx = await this.contracts.trenBoxManagerOperations.getRedemptionHints(
          erc20,
          debtTokenAmount,
          price,
          maxIterations
        );

        const partialRedemptionHintNewICR = ethers.parseUnits("5", 30);

        expect(tx[0]).to.be.equal(this.user[0].address);
        expect(tx[1]).to.be.equal(partialRedemptionHintNewICR);
        expect(tx[2]).to.not.be.equal(0);
      });
    }
  );
}
