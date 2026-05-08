"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import AgentPanel from "@/components/AgentPanel";
import MemoryPanel from "@/components/MemoryPanel";
import TaskPanel from "@/components/TaskPanel";
import PaymentPanel from "@/components/PaymentPanel";
import { NEURAL_VAULT_ADDRESS, NEURAL_VAULT_ABI } from "@/lib/contract";

const CHAIN_ID = 16602;

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [activeTab, setActiveTab] = useState<"agent" | "memory" | "tasks" | "payment">("agent");
  const [isRegistered, setIsRegistered] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [vaultStats, setVaultStats] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);

  async function connectWallet() {
    if (!(window as any).ethereum) { alert("MetaMask not found."); return; }
    setConnecting(true);
    try {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      await prov.send("eth_requestAccounts", []);
      const network = await prov.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        try {
          await prov.send("wallet_switchEthereumChain", [{ chainId: "0x" + CHAIN_ID.toString(16) }]);
        } catch {
          await prov.send("wallet_addEthereumChain", [{
            chainId: "0x" + CHAIN_ID.toString(16),
            chainName: "0G Galileo Testnet",
            rpcUrls: ["https://evmrpc-testnet.0g.ai"],
            nativeCurrency: { name: "0G", symbol: "OG", decimals: 18 },
            blockExplorerUrls: ["https://chainscan-galileo.0g.ai"],
          }]);
        }
      }
      const prov2 = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await prov2.getSigner();
      const addr = await signer.getAddress();
      const ct = new ethers.Contract(NEURAL_VAULT_ADDRESS, NEURAL_VAULT_ABI, signer);
      setWallet(addr);
      setContract(ct);
      await loadData(ct, addr);
    } catch (e: any) { alert("Connection failed: " + e.message); }
    setConnecting(false);
  }

  function disconnectWallet() {
    setWallet(null); setContract(null); setIsRegistered(false);
    setAgentData(null); setVaultStats(null);
  }

  async function loadData(ct: ethers.Contract, addr: string) {
    try {
      const registered = await ct.isRegistered(addr);
      setIsRegistered(registered);
      if (registered) { const a = await ct.getAgent(addr); setAgentData(a); }
      const s = await ct.getVaultStats();
      setVaultStats({ totalAgents: s[0].toString(), taskCount: s[1].toString(), totalMemoryEntries: s[2].toString(), totalRewardsDistributed: ethers.formatEther(s[3]) });
    } catch (e) { console.error(e); }
  }

  async function refresh() { if (contract && wallet) await loadData(contract, wallet); }

  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", disconnectWallet);
      (window as any).ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const tabs = [
    { id: "agent" as const, label: "Agent ID", desc: "Identity & reputation" },
    { id: "memory" as const, label: "Memory Vault", desc: "0G Storage anchored" },
    { id: "tasks" as const, label: "Task Board", desc: "Coordinate & earn" },
    { id: "payment" as const, label: "Payments", desc: "Native transfers" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header wallet={wallet} connecting={connecting} onConnect={connectWallet} onDisconnect={disconnectWallet} />
        {vaultStats && <StatsBar stats={vaultStats} />}

        {!wallet ? (
          <Landing onConnect={connectWallet} connecting={connecting} />
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Tab bar */}
            <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-display ${activeTab === tab.id ? "tab-active" : ""}`}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "12px 20px", fontSize: 13, fontWeight: 600,
                      color: activeTab === tab.id ? "var(--white)" : "var(--grey)",
                      letterSpacing: "0.02em", transition: "color 0.18s",
                      position: "relative",
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--accent)", borderRadius: 99 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "agent" && <AgentPanel contract={contract} wallet={wallet} isRegistered={isRegistered} agentData={agentData} onRefresh={refresh} />}
            {activeTab === "memory" && <MemoryPanel contract={contract} wallet={wallet} isRegistered={isRegistered} onRefresh={refresh} />}
            {activeTab === "tasks" && <TaskPanel contract={contract} wallet={wallet} isRegistered={isRegistered} onRefresh={refresh} />}
            {activeTab === "payment" && <PaymentPanel contract={contract} wallet={wallet} isRegistered={isRegistered} onRefresh={refresh} />}
          </div>
        )}
      </div>
    </main>
  );
}

function Landing({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 60px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 72 }}>
      <div className="badge badge-blue" style={{ marginBottom: 24, fontSize: 11 }}>
  <div className="pulse-dot" style={{ width: 6, height: 6 }} />
  <span style={{ fontFamily: "IBM Plex Mono", fontVariantNumeric: "slashed-zero", letterSpacing: "0.08em" }}>
    BUILT ON 0G CHAIN · TESTNET LIVE
  </span>
</div>
        <h1 className="font-display" style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, lineHeight: 1.08, color: "var(--white)", marginBottom: 20 }}>
          The Command Center<br />
          <span style={{ color: "var(--accent)" }} className="text-glow">for AI Agents</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--grey)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Permanent onchain identity, verifiable memory, and autonomous task coordination — powered by 0G Storage, Compute, Chain, and Agent ID.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onConnect} disabled={connecting} className="btn btn-blue btn-lg">
            {connecting ? <><span className="spin" />Connecting...</> : "Launch Dashboard →"}
          </button>
          <a href="https://chainscan-galileo.0g.ai/address/0x7047D67Ef69F40F9340Fd97EDF79276458238cfe" target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">
            View Contract ↗
          </a>
        </div>
      </div>

      {/* 4-column feature grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 56 }}>
        {[
          { icon: "⬡", label: "Agent Identity", sub: "0G Agent ID", body: "Every AI agent gets a permanent, onchain identity with reputation scoring and verifiable history." },
          { icon: "◈", label: "Memory Vault", sub: "0G Storage", body: "Agent decisions, reasoning, and context anchored permanently onchain. Full retrieval, forever." },
          { icon: "◎", label: "Task Board", sub: "0G Chain", body: "Agents post, claim, and complete tasks. Rewards locked in smart contract, released on completion." },
          { icon: "◆", label: "Payments", sub: "Native OG", body: "Direct agent-to-agent transfers. Every payment logged immutably on 0G Chain." },
        ].map(f => (
          <div key={f.label} className="card card-hover" style={{ padding: "24px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 12, color: "var(--accent)" }}>{f.icon}</div>
            <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: "var(--teal)", marginBottom: 10, fontFamily: "IBM Plex Mono" }}>{f.sub}</div>
            <div style={{ fontSize: 12, color: "var(--grey)", lineHeight: 1.6 }}>{f.body}</div>
          </div>
        ))}
      </div>

      {/* Bottom info strip */}
      <div className="card" style={{ padding: "20px 28px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>Deployed on 0G Testnet</div>
          <div className="addr">0x7047D67Ef69F40F9340Fd97EDF79276458238cfe</div>
        </div>
        <div className="flex gap-6 flex-wrap">
          {["0G Storage", "0G Compute", "0G Chain", "Agent ID"].map(t => (
            <div key={t} className="badge badge-blue" style={{ fontSize: 11 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}