import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanTransfer(): void {
  beforeEach(async function () {
    this.collateral = this.collaterals.active.wETH;

    const amountTokensToMint = 5000;
    this.aliceTokenHolder = this.signers.accounts[0];
    this.bobTokenHolder = this.signers.accounts[1];

    this.borrowerOperationsAddress = await this.contracts.borrowerOperations.getAddress();
    this.stabilityPoolAddress = await this.contracts.stabilityPool.getAddress();
    this.trenBoxManagerAddress = await this.contracts.trenBoxManager.getAddress();

    const borrowerOperationsImpostor = this.signers.accounts[1];
    await this.contracts.debtToken.setAddresses(
      borrowerOperationsImpostor.address,
      this.stabilityPoolAddress,
      this.trenBoxManagerAddress
    );

    await this.contracts.debtToken
      .connect(borrowerOperationsImpostor)
      .mint(this.collateral.address, this.aliceTokenHolder.address, amountTokensToMint);

    await this.contracts.debtToken
      .connect(borrowerOperationsImpostor)
      .mint(this.collateral.address, this.bobTokenHolder.address, amountTokensToMint);
  });

  context("when user has enough tokens", function () {
    context("when recipient is valid", function () {
      it("transfers tokens to specified address", async function () {
        const amountToSend = 100n;

        const initialAliceBalance = await this.contracts.debtToken.balanceOf(
          this.aliceTokenHolder.address
        );
        const initialBobBalance = await this.contracts.debtToken.balanceOf(
          this.bobTokenHolder.address
        );

        await this.contracts.debtToken
          .connect(this.aliceTokenHolder)
          .transfer(this.bobTokenHolder, amountToSend);

        const aliceBalance = await this.contracts.debtToken.balanceOf(
          this.aliceTokenHolder.address
        );
        const bobBalance = await this.contracts.debtToken.balanceOf(this.bobTokenHolder.address);

        expect(aliceBalance).to.be.equal(initialAliceBalance - amountToSend);
        expect(bobBalance).to.be.equal(initialBobBalance + amountToSend);
      });

      it("emits a Transfer event", async function () {
        const amountToSend = 100n;

        await expect(
          this.contracts.debtToken
            .connect(this.aliceTokenHolder)
            .transfer(this.bobTokenHolder, amountToSend)
        )
          .to.emit(this.contracts.debtToken, "Transfer")
          .withArgs(this.aliceTokenHolder, this.bobTokenHolder, amountToSend);
      });

      it("does not update total supply", async function () {
        const amountToSend = 100n;
        const initialTotalSupply = await this.contracts.debtToken.totalSupply();

        await this.contracts.debtToken
          .connect(this.aliceTokenHolder)
          .transfer(this.bobTokenHolder, amountToSend);

        const totalSupply = await this.contracts.debtToken.totalSupply();

        expect(totalSupply).to.be.equal(initialTotalSupply);
      });
    });

    context("when recipient is zero address", function () {
      it("reverts", async function () {
        const amountToSend = 100n;

        await expect(
          this.contracts.debtToken
            .connect(this.aliceTokenHolder)
            .transfer(ethers.ZeroAddress, amountToSend)
        ).to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__CannotTransferTokensToZeroAddress"
        );
      });
    });

    context("when recipient is debt token address", function () {
      it("reverts", async function () {
        const amountToSend = 100n;

        const debtTokenAddress = await this.contracts.debtToken.getAddress();

        await expect(
          this.contracts.debtToken
            .connect(this.aliceTokenHolder)
            .transfer(debtTokenAddress, amountToSend)
        ).to.be.revertedWithCustomError(
          this.contracts.debtToken,
          "DebtToken__CannotTransferTokensToTokenContract"
        );
      });
    });
  });

  context("when user does not have enough tokens", function () {});
}
