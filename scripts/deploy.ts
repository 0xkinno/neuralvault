import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Deploying NeuralVault to 0G Testnet...");

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai", {
    chainId: 16602,
    name: "0g-testnet"
  }, {
    staticNetwork: true,
    polling: true,
    pollingInterval: 4000,
  });

  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from wallet:", wallet.address);

  const artifactPath = join(
    process.cwd(),
    "artifacts",
    "contracts",
    "NeuralVault.sol",
    "NeuralVault.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("Sending deployment transaction...");
  const contract = await factory.deploy();
  console.log("Waiting for confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ NeuralVault deployed to:", address);
  console.log("🔗 Explorer:", `https://chainscan.0g.ai/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});