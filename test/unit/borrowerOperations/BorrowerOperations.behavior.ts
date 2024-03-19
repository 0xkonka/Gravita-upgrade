import shouldBehaveLikeCanOpenTrenBox from "./effects/openTrenBox";
import shouldBehaveLikeNamed from "./view/name";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeBorrowerOperationsContract(): void {
  describe("BorrowerOperations", function () {
    describe("View Functions", function () {
      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });
      describe("#NAME", function () {
        shouldBehaveLikeNamed();
      });

      describe("#getEntireSystemColl", function () {});
      describe("#getEntireSystemDebt", function () {});
      describe("#getCompositeDebt", function () {});

      describe("#AddressesConfigurable", function () {
        describe("#activePool", function () {});
        describe("#adminContract", function () {});
        describe("#borrowerOperations", function () {});
        describe("#collSurplusPool", function () {});
        describe("#communityIssuance", function () {});
        describe("#debtToken", function () {});
        describe("#defaultPool", function () {});
        describe("#feeCollector", function () {});
        describe("#gasPoolAddress", function () {});
        describe("#trenStaking", function () {});
        describe("#priceFeed", function () {});
        describe("#sortedTrenBoxes", function () {});
        describe("#stabilityPool", function () {});
        describe("#timelockAddress", function () {});
        describe("#treasuryAddress", function () {});
        describe("#trenBoxManager", function () {});
        describe("#trenBoxManagerOperations", function () {});
        describe("#isAddressSetupInitialized", function () {});
      });
    });
    describe("Effects Functions", function () {
      describe("#openTrenBox", function () {
        shouldBehaveLikeCanOpenTrenBox();
      });
      describe("#addColl", function () {});
      describe("#withdrawColl", function () {});
      describe("#withdrawDebtTokens", function () {});
      describe("#repayDebtTokens", function () {});
      describe("#adjustTrenBox", function () {});
      describe("#closeTrenBox", function () {});
      describe("#claimCollateral", function () {});
    });

    describe("Upgradable", function () {});
  });
}
