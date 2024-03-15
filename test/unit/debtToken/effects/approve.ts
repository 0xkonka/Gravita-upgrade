import { expect } from "chai";

export default function shouldBehaveLikeCanApprove(): void {
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

  it("approves tokens to specified address", async function () {
    const amountToApprove = 100n;

    const initialAliceAllowance = await this.contracts.debtToken.allowance(
      this.aliceTokenHolder.address,
      this.bobTokenHolder.address
    );

    await this.contracts.debtToken
      .connect(this.aliceTokenHolder)
      .approve(this.bobTokenHolder.address, amountToApprove);

    const aliceAllowance = await this.contracts.debtToken.allowance(
      this.aliceTokenHolder.address,
      this.bobTokenHolder.address
    );

    expect(aliceAllowance).to.be.equal(initialAliceAllowance + amountToApprove);
  });

  it("emits an Approval event", async function () {
    const amountToApprove = 100n;

    await expect(
      this.contracts.debtToken
        .connect(this.aliceTokenHolder)
        .approve(this.bobTokenHolder.address, amountToApprove)
    )
      .to.emit(this.contracts.debtToken, "Approval")
      .withArgs(this.aliceTokenHolder.address, this.bobTokenHolder.address, amountToApprove);
  });
}
