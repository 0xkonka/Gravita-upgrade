import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TimeLockModule = buildModule("TimeLockModule", (m) => {
  // const deployer = m.getAccount(0);

  // const delay = "172800"; // 2 days
  // const adminAddress = deployer;

  // const token = m.contract("Timelock", [delay, adminAddress], { from: deployer });
  const token = m.contract("ERC20Test");
  // m.call(myContract, "myFunction", ["argument1", "argument2"]);

  // const existingToken = m.contractAt("ERC20Test", token, { id: "TimeLockModule" });

  return { token };
});

export default TimeLockModule;

