import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanFlashLoan from "./effects/flashLoan";
import shouldBehaveLikeCanFlashLoanForRepay from "./effects/flashLoanForRepay";
import shouldBehaveLikeCanSetInternalAddresses from "./effects/setInternalAddresses";
import shouldHaveFeeDenominator from "./view/constants/feeDenominator";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetFlashLoanRate from "./view/getFlashLoanRate";
import shouldHaveIsSetupInitialized from "./view/isSetupInitialized";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeFlashLoanContract(): void {
  describe("View Functions", function () {
    describe("#name", function () {
      shouldHaveName();
    });

    describe("#FEE_DENOMINATOR", function () {
      shouldHaveFeeDenominator();
    });

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#isSetupInitialized", function () {
      shouldHaveIsSetupInitialized();
    });

    describe("#getFlashLoanRate", function () {
      shouldBehaveLikeGetFlashLoanRate();
    });
  });

  describe("Effects Functions", function () {
    describe("#setInternalAddresses", function () {
      shouldBehaveLikeCanSetInternalAddresses();
    });

    describe("#flashLoan", function () {
      shouldBehaveLikeCanFlashLoan();
    });

    describe("#flashLoanForRepay", function () {
      shouldBehaveLikeCanFlashLoanForRepay();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
