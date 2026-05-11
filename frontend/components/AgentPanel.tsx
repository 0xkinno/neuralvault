"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface Props {
  contract: ethers.Contract | null;
  wallet: string | null;
  isRegistered: boolean;
  agentData: any;
  onRefresh: () => void;
}

const AGENT_TYPES = ["Researcher", "Trader", "Executor", "Memory", "Coordinator", "Analyst"];

export default function AgentPanel({ contract, wallet, isRegistered, agentData, onRefresh }: Props) {
  const [name, setName] = useState("");
  const [agentType, setAgentType] = useState("Researcher");
  const [metadataHash, setMetadataHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function register() {
    if (!contract || !name) return;
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const tx = await contract.registerAgent(name, agentType, metadataHash || "ipfs://metadata");
      setMsg({ type: "info", text: "Transaction submitted. Waiting for confirmation..." });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg({ type: "success", text: `Agent "${name}" registered successfully on 0G Chain!` });
      onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message || "Transaction failed" });
    }
    setLoading(false);
  }

  async function deactivate() {
    if (!contract) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.deactivateAgent();
      await tx.wait();
      setMsg({ type: "success", text: "Agent deactivated." });
      onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  async function reactivate() {
    if (!contract) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.reactivateAgent();
      await tx.wait();
      setMsg({ type: "success", text: "Agent reactivated!" });
      onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  async function deleteAgentFn() {
    if (!contract || !confirm("Delete agent permanently? You can register a new one after.")) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.deleteAgent();
      setMsg({ type: "info", text: "Deleting agent... refreshing in 5s." });
      await tx.wait();
      setTimeout(() => { onRefresh(); setMsg(null); }, 2000);
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  const typeColor: Record<string, string> = {
    Researcher: "var(--purple)",
    Trader: "var(--amber)",
    Executor: "var(--teal)",
    Memory: "var(--accent-bright)",
    Coordinator: "var(--green)",
    Analyst: "var(--red)",
  };

  // Reusable TX hash display
  const TxLink = ({ hash }: { hash: string }) => (
    <div style={{ fontSize: 11, padding: "10px 14px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)", fontFamily: "IBM Plex Mono, monospace" }}>
      ✓ TX: <a
        href={`https://chainscan.0g.ai/tx/${hash}`}
        target="_blank"
        rel="noreferrer"
        style={{ color: "var(--teal)" }}
      >
        {hash.slice(0, 20)}...{hash.slice(-8)}
      </a>
    </div>
  );

  if (isRegistered && agentData) {
    const repScore = Number(agentData.reputation);
    const repPercent = Math.min((repScore / 500) * 100, 100);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Identity card */}
        <div className="card card-accent" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `linear-gradient(135deg, ${typeColor[agentData.agentType] || "var(--accent)"}, var(--bg))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 14, border: "1px solid var(--border-light)",
              }}>🤖</div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: "var(--white)", marginBottom: 6 }}>
                {agentData.name}
              </div>
              <span className="badge badge-teal">{agentData.agentType}</span>
            </div>
            <div className="rep-ring">{repScore}</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--grey)", fontFamily: "IBM Plex Mono" }}>REPUTATION</span>
              <span style={{ fontSize: 11, color: "var(--accent-bright)", fontFamily: "IBM Plex Mono" }}>{repScore}/500</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${repPercent}%` }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Tasks Done", value: agentData.tasksCompleted?.toString() || "0" },
              { label: "Total Earned", value: ethers.formatEther(agentData.totalEarned || 0) + " OG" },
            ].map(s => (
              <div key={s.label} className="stat">
                <div style={{ fontSize: 11, color: "var(--grey)", marginBottom: 4, fontFamily: "IBM Plex Mono" }}>{s.label}</div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--white)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "var(--grey)", marginBottom: 4, fontFamily: "IBM Plex Mono", letterSpacing: "0.06em" }}>WALLET</div>
            <div className="addr">{wallet}</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge ${agentData.active ? "badge-green" : "badge-red"}`}>
              {agentData.active ? "● Active" : "● Inactive"}
            </span>
            <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "IBM Plex Mono" }}>
              1 agent per wallet address
            </span>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 16, fontSize: 14 }}>0G Storage Metadata</div>
            <div style={{ fontSize: 11, color: "var(--grey)", marginBottom: 8, fontFamily: "IBM Plex Mono" }}>METADATA HASH</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--teal)", wordBreak: "break-all" }}>
              {agentData.metadataHash || "Not set"}
            </div>
            <div style={{ fontSize: 11, color: "var(--grey)", marginTop: 12, fontFamily: "IBM Plex Mono" }}>
              Registered: {new Date(Number(agentData.registeredAt) * 1000).toLocaleDateString()}
            </div>
          </div>

          <div className="card card-teal" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, color: "var(--grey)", marginBottom: 12, fontFamily: "IBM Plex Mono" }}>HOW REPUTATION WORKS</div>
            {[
              { action: "Register agent", points: "+100" },
              { action: "Complete a task", points: "+10" },
              { action: "Owner boost", points: "+custom" },
            ].map(r => (
              <div key={r.action} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                <span style={{ color: "var(--grey)" }}>{r.action}</span>
                <span style={{ color: "var(--teal)", fontFamily: "IBM Plex Mono" }}>{r.points}</span>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ padding: 20, border: "1px solid rgba(240,79,106,0.2)" }}>
            <div style={{ fontSize: 11, color: "var(--red)", fontFamily: "IBM Plex Mono", letterSpacing: "0.08em", marginBottom: 4 }}>DANGER ZONE</div>
            <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 14 }}>
              {agentData.active ? "Deactivate pauses your agent." : "Your agent is currently inactive."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agentData.active ? (
                <button onClick={deactivate} disabled={loading} className="btn btn-danger" style={{ width: "100%" }}>
                  {loading ? <><span className="spin" />Processing...</> : "Deactivate Agent"}
                </button>
              ) : (
                <button onClick={reactivate} disabled={loading} className="btn btn-teal" style={{ width: "100%" }}>
                  {loading ? <><span className="spin" />Processing...</> : "Reactivate Agent"}
                </button>
              )}
              <button onClick={deleteAgentFn} disabled={loading} className="btn btn-danger" style={{ width: "100%", opacity: 0.7 }}>
                {loading ? <><span className="spin" />Deleting...</> : "Delete & Re-register"}
              </button>
            </div>
          </div>

          {msg && <div className={`alert-${msg.type}`}>{msg.text}</div>}
          {txHash && <TxLink hash={txHash} />}
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="card card-accent" style={{ padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <div className="section-title" style={{ marginBottom: 8 }}>Register Your Agent</div>
          <div style={{ fontSize: 13, color: "var(--grey)", lineHeight: 1.6 }}>
            Create a permanent onchain identity for your AI agent on 0G Chain
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Agent Name *</label>
            <input className="input" placeholder="e.g. ResearchBot-Alpha" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Agent Type *</label>
            <select className="select" value={agentType} onChange={e => setAgentType(e.target.value)}>
              {AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">0G Storage Metadata Hash (optional)</label>
            <input className="input" placeholder="0x... or Qm..." value={metadataHash} onChange={e => setMetadataHash(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 6, fontFamily: "IBM Plex Mono" }}>
              Upload agent profile to 0G Storage and paste root hash here
            </div>
          </div>

          <button className="btn btn-blue btn-lg" onClick={register} disabled={loading || !name} style={{ width: "100%", marginTop: 8 }}>
            {loading ? <><span className="spin" />Registering on 0G Chain...</> : "Register Agent →"}
          </button>

          {msg && <div className={`alert-${msg.type}`}>{msg.text}</div>}
          {txHash && <TxLink hash={txHash} />}
        </div>
      </div>
    </div>
  );
}