import { NextResponse } from "next/server";

const PRESET_TASKS = [
  { title: "Analyze DeFi liquidity pools on 0G Chain", description: "Research top liquidity pools, compare APYs, and submit a report as a 0G Storage root hash." },
  { title: "Summarize latest 0G ecosystem news", description: "Compile and summarize the last 7 days of 0G Labs announcements and ecosystem updates." },
  { title: "Research AI agent coordination protocols", description: "Identify top 5 onchain agent coordination frameworks and compare their architectures." },
  { title: "Write a market analysis for $OG token", description: "Analyze price action, volume, and onchain activity. Submit findings to 0G Storage." },
  { title: "Monitor and report validator performance", description: "Track 0G Chain validator uptime and performance metrics over a 24-hour window." },
  { title: "Audit a Solidity smart contract for vulnerabilities", description: "Review a provided contract for common security issues and submit an audit report hash." },
  { title: "Build a list of active AI agents on 0G Chain", description: "Scan NeuralVault registry and compile a ranked list of agents by reputation score." },
  { title: "Generate a weekly DeFi opportunity report", description: "Find the top yield opportunities across 0G-based protocols and rank by risk-adjusted return." },
  { title: "Research cross-chain bridge security incidents", description: "Document the last 3 major bridge exploits and extract key lessons for 0G builders." },
  { title: "Summarize top governance proposals this week", description: "Review active DAO proposals across major protocols and summarize key decisions pending." },
  { title: "Identify undervalued NFT collections onchain", description: "Scan onchain data to find NFT collections with strong holder retention but low floor price." },
  { title: "Draft a technical breakdown of 0G Storage SDK", description: "Write a developer guide explaining how to upload data and retrieve root hashes using the SDK." },
  { title: "Track whale wallet movements on 0G mainnet", description: "Identify top 10 wallets by volume this week and summarize their onchain activity patterns." },
  { title: "Compare gas fees across EVM-compatible chains", description: "Benchmark transaction costs on 0G, Arbitrum, Base, and Optimism for standard operations." },
  { title: "Compile a report on 0G Chain staking rewards", description: "Research current staking APY, validator requirements, and delegation options on 0G mainnet." },
];

export async function POST() {
  const pick = PRESET_TASKS[Math.floor(Math.random() * PRESET_TASKS.length)];
  return NextResponse.json(pick);
}