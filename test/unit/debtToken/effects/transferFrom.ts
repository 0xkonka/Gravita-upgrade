import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanTransferFrom(): void {
  beforeEach(async function () {
    this.collateral = this.collaterals.active.wETH;

    const amountTokensToMint = 500;
    this.aliceTokenHolder = this.signers.accounts[0];
    this.bobTokenHolder = this.signers.accounts[1];
    this.spender = this.signers.accounts[2];

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

    await this.contracts.debtToken
      .connect(this.aliceTokenHolder)
      .approve(this.spender.address, 100n);
  });

  context("when spender has enough allowance", function () {
    context("when owner has enough funds", function () {
      context("when recipient is valid", function () {
        it("transfers tokens from specified address", async function () {
          const amountToTransfer = 100n;

          const initialAliceBalance = await this.contracts.debtToken.balanceOf(
            this.aliceTokenHolder.address
          );
          const initialBobBalance = await this.contracts.debtToken.balanceOf(
            this.bobTokenHolder.address
          );

          await this.contracts.debtToken
            .connect(this.spender)
            .transferFrom(
              this.aliceTokenHolder.address,
              this.bobTokenHolder.address,
              amountToTransfer
            );

          const aliceBalance = await this.contracts.debtToken.balanceOf(
            this.aliceTokenHolder.address
          );
          const bobBalance = await this.contracts.debtToken.balanceOf(this.bobTokenHolder.address);

          expect(aliceBalance).to.be.equal(initialAliceBalance - amountToTransfer);
          expect(bobBalance).to.be.equal(initialBobBalance + amountToTransfer);
        });

        it("emits a Transfer event", async function () {
          const amountToTransfer = 100n;

          await expect(
            this.contracts.debtToken
              .connect(this.spender)
              .transferFrom(
                this.aliceTokenHolder.address,
                this.bobTokenHolder.address,
                amountToTransfer
              )
          )
            .to.emit(this.contracts.debtToken, "Transfer")
            .withArgs(this.aliceTokenHolder.address, this.bobTokenHolder.address, amountToTransfer);
        });

        it("decreases allowance", async function () {
          const amountToTransfer = 100n;

          const initialAllowance = await this.contracts.debtToken.allowance(
            this.aliceTokenHolder.address,
            this.spender.address
          );

          await this.contracts.debtToken
            .connect(this.spender)
            .transferFrom(
              this.aliceTokenHolder.address,
              this.bobTokenHolder.address,
              amountToTransfer
            );

          const allowance = await this.contracts.debtToken.allowance(
            this.aliceTokenHolder.address,
            this.spender.address
          );

          expect(allowance).to.be.equal(initialAllowance - amountToTransfer);
        });

        it("does not change total supply", async function () {
          const amountToTransfer = 100n;
          const initialTotalSupply = await this.contracts.debtToken.totalSupply();

          await this.contracts.debtToken
            .connect(this.spender)
            .transferFrom(
              this.aliceTokenHolder.address,
              this.bobTokenHolder.address,
              amountToTransfer
            );

          const totalSupply = await this.contracts.debtToken.totalSupply();

          expect(totalSupply).to.be.equal(initialTotalSupply);
        });
      });

      context("when recipient is zero address", function () {
        it("reverts", async function () {
          const amountToTransfer = 100n;

          await expect(
            this.contracts.debtToken
              .connect(this.spender)
              .transferFrom(this.aliceTokenHolder.address, ethers.ZeroAddress, amountToTransfer)
          ).to.be.revertedWith(
            "DebtToken: Cannot transfer tokens directly to the token contract or the zero address"
          );
        });
      });

      context("when recipient is the debt token contract", function () {
        it("reverts", async function () {
          const amountToTransfer = 100n;

          const debtTokenAddress = await this.contracts.debtToken.getAddress();

          await expect(
            this.contracts.debtToken
              .connect(this.spender)
              .transferFrom(this.aliceTokenHolder.address, debtTokenAddress, amountToTransfer)
          ).to.be.revertedWith(
            "DebtToken: Cannot transfer tokens directly to the token contract or the zero address"
          );
        });
      });
    });

    context("when owner does not have enough funds", function () {
      it("reverts", async function () {
        const aliceBalance = await this.contracts.debtToken.balanceOf(
          this.aliceTokenHolder.address
        );

        const amountToTransfer = aliceBalance + 1n;

        await this.contracts.debtToken
          .connect(this.aliceTokenHolder)
          .approve(this.spender.address, amountToTransfer);

        await expect(
          this.contracts.debtToken
            .connect(this.spender)
            .transferFrom(
              this.aliceTokenHolder.address,
              this.bobTokenHolder.address,
              amountToTransfer
            )
        ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
      });
    });
  });

  context("when spender does not have enough allowance", function () {
    it("reverts", async function () {
      const spenderAllowance = await this.contracts.debtToken.allowance(
        this.aliceTokenHolder.address,
        this.spender.address
      );

      const amountToTransfer = spenderAllowance + 1n;

      await expect(
        this.contracts.debtToken
          .connect(this.spender)
          .transferFrom(
            this.aliceTokenHolder.address,
            this.bobTokenHolder.address,
            amountToTransfer
          )
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientAllowance");
    });
  });
}
