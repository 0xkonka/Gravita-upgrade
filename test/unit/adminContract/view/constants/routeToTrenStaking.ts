import { expect } from "chai";

export default function shouldHaveRouteToTrenStaking(): void {
  it("should retrieve correct routeToTRENStaking", async function () {
    expect(await this.contracts.adminContract.routeToTRENStaking()).to.be.equal(false);
  });
}
