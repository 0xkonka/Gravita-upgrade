import { expect } from "chai";
import { ethers } from "hardhat";

import { BorrowerOperationType, TrenBoxStatus } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanOpenTrenBox() {
  beforeEach(async function () {
    const users = [this.signers.accounts[0], this.signers.accounts[1]];

    this.upperHint = DEFAULT_UPPER_HINT;
    this.lowerHint = DEFAULT_LOWER_HINT;

    const { erc20 } = this.testContracts;

    await this.utils.setupCollateralForTests({
      collateral: erc20,
      collateralOptions: {
        setAsActive: true,
        price: ethers.parseUnits("200", "ether"),
        mints: [
          {
            to: users[0].address,
            amount: ethers.parseUnits("100", 30),
          },
          {
            to: users[1].address,
            amount: ethers.parseUnits("100", 30),
          },
        ],
      },
    });

    await this.utils.setUsers(users);
  });

  context("when asset is active", function () {
    context("when there is no active tren box for the asset", function () {
      beforeEach(async function () {
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const mintCap = ethers.parseUnits("100", 35);
        await this.contracts.adminContract.setMintCap(asset, mintCap);
      });

      context("when asset minNetDebt is greater than taken debt", function () {
        beforeEach(async function () {
          const { erc20 } = this.testContracts;
          const asset = await erc20.getAddress();
          const mintCap = ethers.parseUnits("100", 35);
          await this.contracts.adminContract.setMintCap(asset, mintCap);
        });

        it("should revert", async function () {
          const { adminContract, borrowerOperations } = this.contracts;
          const [user] = this.users;
          const { erc20 } = this.testContracts;
          const asset = await erc20.getAddress();
          const assetAmount = ethers.parseUnits("100", 30);

          const minNetDebt = await adminContract.getMinNetDebt(asset);

          const netBorrowingAmount = await this.utils.getNetBorrowingAmount({
            asset,
            debtWithFees: minNetDebt,
          });

          const debtTokenAmount = netBorrowingAmount - 1n;

          const openTrenBoxTx = borrowerOperations
            .connect(user)
            .openTrenBox(
              asset,
              assetAmount,
              debtTokenAmount,
              DEFAULT_UPPER_HINT,
              DEFAULT_LOWER_HINT
            );

          await expect(openTrenBoxTx).to.be.revertedWith(
            "BorrowerOps: TrenBox's net debt must be greater than minimum"
          );
        });
      });

      context("when composite debt is 0", function () {
        beforeEach(async function () {
          const { adminContract } = this.contracts;
          const { erc20 } = this.testContracts;
          const asset = await erc20.getAddress();

          await adminContract.setMinNetDebt(asset, 0n);
        });

        it("should revert", async function () {
          const { borrowerOperations } = this.contracts;
          const [user] = this.users;
          const { erc20 } = this.testContracts;
          const asset = await erc20.getAddress();
          const assetAmount = ethers.parseUnits("100", 30);

          const debtTokenAmount = 0n;

          const openTrenBoxTx = borrowerOperations
            .connect(user)
            .openTrenBox(
              asset,
              assetAmount,
              debtTokenAmount,
              DEFAULT_UPPER_HINT,
              DEFAULT_LOWER_HINT
            );

          await expect(openTrenBoxTx).to.be.revertedWith("compositeDebt cannot be 0");
        });
      });

      context("when asset is in Recovery Mode", function () {
        context("when ICR is below CCR", function () {
          it.skip("should revert", async function () {});
        });

        context("when ICR is above CCR", function () {
          it.skip("should open tren box", async function () {});
        });
      });

      context("when asset is not in Recovery Mode", function () {
        context("when ICR is below MCR", function () {
          it("should revert", async function () {
            const [user] = this.users;
            const { erc20 } = this.testContracts;
            const asset = await erc20.getAddress();
            const assetAmount = ethers.parseUnits("100", 30);

            await this.testContracts.priceFeedTestnet.setPrice(asset, 200);

            const { openTrenBoxTx } = await this.utils.openTrenBox({
              asset,
              assetAmount,
              from: user,
            });

            await expect(openTrenBoxTx).to.be.revertedWith(
              "BorrowerOps: An operation that would result in ICR < MCR is not permitted"
            );
          });
        });
      });
    });

    context("when there is active tren box for the asset", function () {
      beforeEach(async function () {
        const [user] = this.users;

        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const mintCap = ethers.parseUnits("100", 35);
        await this.contracts.adminContract.setMintCap(asset, mintCap);

        await this.utils.setupProtocolForTests({
          commands: [
            {
              action: "openTrenBox",
              args: {
                asset: asset,
                assetAmount,
                from: user,
              },
            },
          ],
        });
      });

      it("should revert when it's was opened by the same user", async function () {
        const [user] = this.users;

        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: user,
        });

        await expect(openTrenBoxTx).to.be.revertedWith("BorrowerOps: TrenBox is active");
      });

      it("should open tren box when it's was opened by another user", async function () {
        const [, anotherUser] = this.users;

        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: anotherUser,
        });

        await expect(openTrenBoxTx).to.not.be.rejected;
      });
    });

    context("when asset price is 0", function () {
      beforeEach(async function () {
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const mintCap = ethers.parseUnits("100", 35);
        await this.contracts.adminContract.setMintCap(asset, mintCap);
      });

      it("should revert", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        await this.testContracts.priceFeedTestnet.setPrice(assetAddress, 0);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset: assetAddress,
          assetAmount,
          from: user,
        });

        await expect(openTrenBoxTx).to.be.revertedWith(
          "BorrowerOps: An operation that would result in ICR < MCR is not permitted"
        );
      });
    });

    context("when new TCR is below CCR", function () {
      beforeEach(async function () {
        const { adminContract } = this.contracts;
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const mintCap = ethers.parseUnits("100", 35);
        await adminContract.setMintCap(asset, mintCap);
      });

      it.skip("should revert", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const { openTrenBoxTx } = await this.utils.openTrenBox({
          asset,
          assetAmount,
          from: user,
        });

        await expect(openTrenBoxTx).to.be.revertedWith(
          "BorrowerOps: An operation that would result in TCR < CCR is not permitted"
        );
      });
    });

    context("when taken debt is greater than MintCap", function () {
      beforeEach(async function () {
        const { adminContract } = this.contracts;
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const mintCap = ethers.parseUnits("100", 35);
        await adminContract.setMintCap(asset, mintCap);
      });

      it.skip("should revert", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const asset = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const { adminContract, borrowerOperations } = this.contracts;
        const mintCap = await adminContract.getMintCap(asset);

        const debtTokenAmount = mintCap + 1n;

        const openTrenBoxTx = borrowerOperations
          .connect(user)
          .openTrenBox(asset, assetAmount, debtTokenAmount, DEFAULT_UPPER_HINT, DEFAULT_LOWER_HINT);

        await expect(openTrenBoxTx).to.be.revertedWith("Exceeds mint cap");
      });
    });

    it("should set TrenBox status to active", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const { trenBoxManager } = this.contracts;

      const trenBoxStatus = await trenBoxManager.getTrenBoxStatus(asset, user.address);
      expect(trenBoxStatus).to.equal(TrenBoxStatus.active);
    });

    it("should increase TrenBox Collateral amount", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { trenBoxManager } = this.contracts;
      const trenBoxCollBefore = await trenBoxManager.getTrenBoxColl(asset, user.address);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const trenBoxCollAfter = await trenBoxManager.getTrenBoxColl(asset, user.address);
      const expectedTrenBoxColl = trenBoxCollBefore + assetAmount;

      expect(trenBoxCollAfter).to.equal(expectedTrenBoxColl);
    });

    it("should increase TrenBox Debt amount", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { trenBoxManager } = this.contracts;
      const trenBoxDebtBefore = await trenBoxManager.getTrenBoxDebt(asset, user.address);

      const { openTrenBoxTx, totalDebt } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const trenBoxDebtAfter = await trenBoxManager.getTrenBoxDebt(asset, user.address);
      const expectedTrenBoxDebt = trenBoxDebtBefore + totalDebt;

      expect(trenBoxDebtAfter).to.equal(expectedTrenBoxDebt);
    });

    it("should insert tren box into sorted tren boxes", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { sortedTrenBoxes } = this.contracts;

      const containsBefore = await sortedTrenBoxes.contains(asset, user.address);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const containsAfter = await sortedTrenBoxes.contains(asset, user.address);

      expect(containsBefore).to.be.false;
      expect(containsAfter).to.be.true;
    });

    it("should emit TrenBoxCreated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      const { borrowerOperations, trenBoxManager } = this.contracts;
      const expectedIndex = await trenBoxManager.getTrenBoxOwnersCount(asset);

      await expect(openTrenBoxTx)
        .to.emit(borrowerOperations, "TrenBoxCreated")
        .withArgs(asset, user.address, expectedIndex);
    });

    it("should emit TrenBoxUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx, netDebt } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      const { borrowerOperations } = this.contracts;

      const expectedStake = 100000000000000000000000000000000n; // TODO: calculate expected stake

      await expect(openTrenBoxTx)
        .to.emit(borrowerOperations, "TrenBoxUpdated")
        .withArgs(
          asset,
          user.address,
          netDebt,
          assetAmount,
          expectedStake,
          BorrowerOperationType.openTrenBox
        );
    });

    it("should emit BorrowingFeePaid event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx, debtTokenAmount } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      const { borrowerOperations, trenBoxManager } = this.contracts;
      const expectedBorrowingFee = await trenBoxManager.getBorrowingFee(asset, debtTokenAmount);

      await expect(openTrenBoxTx)
        .to.emit(borrowerOperations, "BorrowingFeePaid")
        .withArgs(asset, user.address, expectedBorrowingFee);
    });

    it("should increase asset debt in ActivePool", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { activePool } = this.contracts;
      const assetDebtBefore = await activePool.getDebtTokenBalance(asset);

      const { openTrenBoxTx, totalDebt } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const assetDebtAfter = await activePool.getDebtTokenBalance(asset);
      const expectedAssetDebt = assetDebtBefore + totalDebt;

      expect(assetDebtAfter).to.equal(expectedAssetDebt);
    });

    it("should emit ActivePoolDebtUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { openTrenBoxTx, totalDebt } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      const { activePool } = this.contracts;

      await expect(openTrenBoxTx)
        .to.emit(activePool, "ActivePoolDebtUpdated")
        .withArgs(asset, totalDebt);
    });

    it("should mint new debt tokens to the user", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { debtToken } = this.contracts;
      const debtTokenBalanceBefore = await debtToken.balanceOf(user.address);

      const { openTrenBoxTx, debtTokenAmount } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const debtTokenBalanceAfter = await debtToken.balanceOf(user.address);
      const expectedDebtToken = debtTokenBalanceBefore + debtTokenAmount;

      expect(debtTokenBalanceAfter).to.equal(expectedDebtToken);
    });

    it("should decrease user collateral balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const assetBalanceBefore = await erc20.balanceOf(user.address);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const assetBalanceAfter = await erc20.balanceOf(user.address);
      const expectedAssetBalance = assetBalanceBefore - assetAmount;

      expect(assetBalanceAfter).to.equal(expectedAssetBalance);
    });

    it("should increase collateral balance in ActivePool", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);

      const { activePool } = this.contracts;
      const assetBalanceBefore = await activePool.getAssetBalance(asset);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      await (await openTrenBoxTx).wait();

      const assetBalanceAfter = await activePool.getAssetBalance(asset);
      const expectedAssetBalance = assetBalanceBefore + assetAmount;

      expect(assetBalanceAfter).to.equal(expectedAssetBalance);
    });

    it("should emit ActivePoolAssetBalanceUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const asset = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("100", 30);
      const { activePool } = this.contracts;

      const assetBalanceBefore = await activePool.getAssetBalance(asset);

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset,
        assetAmount,
        from: user,
      });

      const expectedAssetBalance = assetBalanceBefore + assetAmount;

      await expect(openTrenBoxTx)
        .to.emit(activePool, "ActivePoolAssetBalanceUpdated")
        .withArgs(asset, expectedAssetBalance);
    });
  });

  context("when asset is not active", function () {
    it("should revert", async function () {
      const notActiveAsset = this.collaterals.inactive.dai;

      const [user] = this.users;

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notActiveAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWith("BorrowerOperations: Asset is not active");
    });
  });

  context("when asset is not supported", function () {
    it("should revert", async function () {
      const notSupportedAsset = this.collaterals.notAdded.testCollateral;

      const user = this.signers.accounts[0];

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notSupportedAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });
}
