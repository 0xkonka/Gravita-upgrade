import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DebtToken", (m) => {
  const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const _borrowerOperationsAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const _stabilityPoolAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const _trenBoxManagerAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  const debtToken = m.contract("DebtToken", [owner]);

  m.call(debtToken, "setAddresses", [_borrowerOperationsAddress, _stabilityPoolAddress, _trenBoxManagerAddress]);

  return { debtToken };
});