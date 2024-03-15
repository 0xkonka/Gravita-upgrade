import { shouldBehaveLikeAdminContractContract } from "./AdminContract.behavior";

export function testAdminContract(): void {
  describe("AdminContract", function () {
    beforeEach(async function () {});

    shouldBehaveLikeAdminContractContract();
  });
}
