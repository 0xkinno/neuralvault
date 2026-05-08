import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NeuralVaultModule = buildModule("NeuralVaultModule", (m) => {
  const neuralVault = m.contract("NeuralVault");
  return { neuralVault };
});

export default NeuralVaultModule;