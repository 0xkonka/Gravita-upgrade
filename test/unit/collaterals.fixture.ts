import { LOCAL_NETWORK_COLLATERALS } from "../../config/collaterals";
import { Collaterals } from "../shared/types";

export function loadCollateralsFixture(): Collaterals {
  return {
    wETH: LOCAL_NETWORK_COLLATERALS[0],
  };
}
