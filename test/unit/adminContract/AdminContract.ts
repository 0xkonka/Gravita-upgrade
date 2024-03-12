import { shouldBehaveLikeAdminContractContract } from "./AdminContract.behavior";
import { adminContractFixture } from "./AdminContract.fixture";

export function testAdminContract(): void {
  describe("AdminContract", function () {
    beforeEach(async function () {});

    shouldBehaveLikeAdminContractContract();
  });
}
