import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReturnFromPool(): void {
  beforeEach(async function () {
    this.collateral = this.collaterals.active.wETH;

    const amountTokensToMint = 500;
    this.tokenHolder = this.signers.accounts[0].address;
    this.pool = this.signers.accounts[1].address;

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
      .mint(this.collateral.address, this.pool, amountTokensToMint);
  });

  context("when caller is trenBoxManager", function () {
    beforeEach(async function () {
      this.caller = this.signers.accounts[2];

      await this.contracts.debtToken.setAddresses(
        this.borrowerOperationsAddress,
        this.stabilityPoolAddress,
        this.caller.address
      );
    });

    shouldBeAbleToReturnFromPool();
  });
  context("when caller is stabilityPool", function () {
    beforeEach(async function () {
      this.caller = this.signers.accounts[2];

      await this.contracts.debtToken.setAddresses(
        this.borrowerOperationsAddress,
        this.caller.address,
        this.trenBoxManagerAddress
      );
    });

    shouldBeAbleToReturnFromPool();
  });
  context("when caller is not trenBoxManager or stabilityPool", function () {
    it("reverts", async function () {
      const impostorCaller = this.signers.accounts[2];

      await expect(
        this.contracts.debtToken
          .connect(impostorCaller)
          .returnFromPool(this.pool, this.tokenHolder, 100n)
      ).to.be.revertedWith("DebtToken: Caller is neither TrenBoxManager nor StabilityPool");
    });
  });

  function shouldBeAbleToReturnFromPool() {
    context("when pool has sufficient balance", function () {
      context("when recipient is valid", function () {
        it("transfers tokens to specified pool address", async function () {
          const amountToReturn = 100n;

          const initialPoolBalance = await this.contracts.debtToken.balanceOf(this.pool);
          const initialHolderBalance = await this.contracts.debtToken.balanceOf(this.tokenHolder);

          await this.contracts.debtToken
            .connect(this.caller)
            .returnFromPool(this.pool, this.tokenHolder, amountToReturn);

          const poolBalance = await this.contracts.debtToken.balanceOf(this.pool);
          const holderBalance = await this.contracts.debtToken.balanceOf(this.tokenHolder);

          expect(poolBalance).to.be.equal(initialPoolBalance - amountToReturn);
          expect(holderBalance).to.be.equal(initialHolderBalance + amountToReturn);
        });

        it("emits a Transfer event", async function () {
          const amountToReturn = 100n;

          await expect(
            this.contracts.debtToken
              .connect(this.caller)
              .returnFromPool(this.pool, this.tokenHolder, amountToReturn)
          )
            .to.emit(this.contracts.debtToken, "Transfer")
            .withArgs(this.pool, this.tokenHolder, amountToReturn);
        });
      });

      context("when recipient is zero address", function () {
        it.skip("reverts", async function () {
          const amountToReturn = 100n;

          await expect(
            this.contracts.debtToken
              .connect(this.caller)
              .returnFromPool(this.pool, ethers.ZeroAddress, amountToReturn)
          ).to.be.revertedWith(
            "DebtToken: Cannot transfer tokens directly to the token contract or the zero address"
          );
        });
      });

      context("when recipient is the token contract", function () {
        it.skip("reverts", async function () {
          const amountToReturn = 100n;

          const debtTokenAddress = await this.contracts.debtToken.getAddress();

          await expect(
            this.contracts.debtToken
              .connect(this.caller)
              .returnFromPool(this.pool, debtTokenAddress, amountToReturn)
          ).to.be.revertedWith(
            "DebtToken: Cannot transfer tokens directly to the token contract or the zero address"
          );
        });
      });
    });

    context("when pool has insufficient balance", function () {
      it("reverts", async function () {
        const poolBalance = await this.contracts.debtToken.balanceOf(this.pool);
        const amountToReturn = poolBalance + 1n;

        await expect(
          this.contracts.debtToken
            .connect(this.caller)
            .returnFromPool(this.pool, this.tokenHolder, amountToReturn)
        ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
      });
    });
  }
}
