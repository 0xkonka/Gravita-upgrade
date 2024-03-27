import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanBurn(): void {
  beforeEach(async function () {
    this.impostor = this.signers.accounts[1];

    this.borrowerOperationsImpostor = this.signers.accounts[2];
    this.stabilityPoolImpostor = this.signers.accounts[3];
    this.trenBoxManagerImpostor = this.signers.accounts[4];

    this.collateral = this.collaterals.active.wETH;
    this.tokenRecipient = this.signers.accounts[2];

    await this.contracts.debtToken.setAddresses(
      this.borrowerOperationsImpostor.address,
      await this.contracts.stabilityPool.getAddress(),
      await this.contracts.trenBoxManager.getAddress()
    );

    await this.contracts.debtToken
      .connect(this.borrowerOperationsImpostor)
      .mint(this.collateral.address, this.tokenRecipient.address, 100);

    await this.contracts.debtToken.setAddresses(
      await this.contracts.borrowerOperations.getAddress(),
      await this.contracts.stabilityPool.getAddress(),
      await this.contracts.trenBoxManager.getAddress()
    );
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      await this.contracts.debtToken.setAddresses(
        this.borrowerOperationsImpostor.address,
        await this.contracts.stabilityPool.getAddress(),
        await this.contracts.trenBoxManager.getAddress()
      );

      this.impostor = this.borrowerOperationsImpostor;
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      await this.contracts.debtToken.setAddresses(
        await this.contracts.borrowerOperations.getAddress(),
        await this.contracts.stabilityPool.getAddress(),
        this.trenBoxManagerImpostor.address
      );

      this.impostor = this.trenBoxManagerImpostor;
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      await this.contracts.debtToken.setAddresses(
        await this.contracts.borrowerOperations.getAddress(),
        this.stabilityPoolImpostor.address,
        await this.contracts.trenBoxManager.getAddress()
      );

      this.impostor = this.stabilityPoolImpostor;
    });

    shouldBehaveLikeCanBurnCorrectly();
  });

  context(
    "when caller is not borrower operations, tren box manager, or stability pool",
    function () {
      it("reverts", async function () {
        const amountToBurn = 50n;

        await expect(
          this.contracts.debtToken
            .connect(this.impostor)
            .burn(this.tokenRecipient.address, amountToBurn)
        ).to.be.revertedWith(
          "DebtToken: Caller is neither BorrowerOperations nor TrenBoxManager nor StabilityPool"
        );
      });
    }
  );
}

function shouldBehaveLikeCanBurnCorrectly() {
  it("burns tokens from account", async function () {
    const amountToBurn = 50n;

    const initialBalance = await this.contracts.debtToken.balanceOf(this.tokenRecipient.address);

    await this.contracts.debtToken
      .connect(this.impostor)
      .burn(this.tokenRecipient.address, amountToBurn);

    const debtTokenBalance = await this.contracts.debtToken.balanceOf(this.tokenRecipient.address);

    expect(debtTokenBalance).to.be.equal(initialBalance - amountToBurn);
  });

  it("emits a Transfer event", async function () {
    const amountToBurn = 50n;

    await expect(
      this.contracts.debtToken
        .connect(this.impostor)
        .burn(this.tokenRecipient.address, amountToBurn)
    )
      .to.emit(this.contracts.debtToken, "Transfer")
      .withArgs(this.tokenRecipient.address, ethers.ZeroAddress, amountToBurn);
  });

  it("reduce total supply", async function () {
    const amountToBurn = 50n;
    const initialTotalSupply = await this.contracts.debtToken.totalSupply();

    await this.contracts.debtToken
      .connect(this.impostor)
      .burn(this.tokenRecipient.address, amountToBurn);

    const totalSupply = await this.contracts.debtToken.totalSupply();

    expect(totalSupply).to.be.equal(initialTotalSupply - amountToBurn);
  });
}
