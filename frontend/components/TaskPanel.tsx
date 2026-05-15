"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface Props {
  contract: ethers.Contract | null;
  wallet: string | null;
  isRegistered: boolean;
  onRefresh: () => void;
}

const STATUS_LABELS = ["Open", "Claimed", "Completed", "Cancelled"];
const STATUS_COLORS = ["#2dd4bf", "#f59e0b", "#10b981", "#f43f5e"];
const STATUS_BG = ["rgba(45,212,191,0.08)", "rgba(245,158,11,0.08)", "rgba(16,185,129,0.08)", "rgba(244,63,94,0.08)"];
const STATUS_BORDER = ["rgba(45,212,191,0.25)", "rgba(245,158,11,0.25)", "rgba(16,185,129,0.25)", "rgba(244,63,94,0.25)"];

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

const label = (style: object, children: React.ReactNode) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: "#8aa8c8", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 7, ...style }}>{children}</div>
);

export default function TaskPanel({ contract, wallet, isRegistered, onRefresh }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [resultHash, setResultHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (contract) loadTasks();
  }, [contract]);

  // ── No API needed — picks randomly from 15 presets, loops forever ──
  async function generateTask() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600)); // loading feel
    const pick = PRESET_TASKS[Math.floor(Math.random() * PRESET_TASKS.length)];
    setTitle(pick.title);
    setDescription(pick.description);
    setGenerating(false);
  }

  async function loadTasks() {
    if (!contract) return;
    setLoadingTasks(true);
    try {
      const count = await contract.taskCount();
      const all = [];
      for (let i = 1; i <= Number(count); i++) {
        const t = await contract.getTask(i);
        all.push(t);
      }
      setTasks(all.reverse());
    } catch (e) { console.error(e); }
    setLoadingTasks(false);
  }

  async function postTask() {
    if (!contract || !title || !reward) return;
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const rewardWei = ethers.parseEther(reward);
      const tx = await contract.postTask(title, description, { value: rewardWei });
      setMsg({ type: "info", text: "Posting task to 0G Chain..." });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg({ type: "success", text: "Task posted! Reward locked in contract." });
      setTitle(""); setDescription(""); setReward("");
      loadTasks(); onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  async function claimTask(taskId: number) {
    if (!contract) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.claimTask(taskId);
      await tx.wait();
      setMsg({ type: "success", text: `Task #${taskId} claimed!` });
      loadTasks(); onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  async function completeTask(taskId: number) {
    if (!contract || !resultHash) return;
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const tx = await contract.completeTask(taskId, resultHash);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg({ type: "success", text: `Task #${taskId} completed! Reward released.` });
      setResultHash(""); setActiveTaskId(null);
      loadTasks(); onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  async function cancelTask(taskId: number) {
    if (!contract) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.cancelTask(taskId);
      await tx.wait();
      setMsg({ type: "success", text: `Task #${taskId} cancelled. Reward refunded.` });
      loadTasks(); onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  const filteredTasks = filter === "all" ? tasks : tasks.filter(t => STATUS_LABELS[t.status] === filter);
  const inputStyle = { background: "#0a1628", borderColor: "#1e3a5f", color: "#e8f0fe" };

  if (!isRegistered) {
    return (
      <div className="empty">
        <div className="empty-icon">◎</div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--grey)", marginBottom: 8 }}>Register an agent first</div>
        <div style={{ fontSize: 13, color: "var(--dim)" }}>Go to Agent ID tab to create your onchain identity</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
      {/* Left: Post task form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 14, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f0fe", fontFamily: "Syne, sans-serif", marginBottom: 4 }}>Post a Task</div>
            <div style={{ fontSize: 12, color: "#6b8aad", fontFamily: "IBM Plex Mono, monospace" }}>Reward locked in contract until completion</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {label({}, "Task Title *")}
              <input className="input" placeholder="e.g. Analyze DeFi market data" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              <button
                type="button"
                onClick={generateTask}
                disabled={generating}
                className="btn btn-outline btn-sm"
                style={{ width: "100%", marginTop: 8 }}
              >
                {generating ? <><span className="spin" />Generating with AI...</> : "✨ Generate Task with AI"}
              </button>
            </div>
            <div>{label({}, "Description")}<textarea className="input" placeholder="Describe the task requirements..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={inputStyle} /></div>
            <div>{label({}, "Reward (0G) *")}<input className="input" type="number" placeholder="0.01" step="0.001" value={reward} onChange={e => setReward(e.target.value)} style={inputStyle} /></div>
            <button className="btn btn-blue btn-lg" onClick={postTask} disabled={loading || !title || !reward} style={{ width: "100%" }}>
              {loading ? <><span className="spin" />Posting...</> : "Post Task & Lock Reward →"}
            </button>
          </div>

          {msg && <div className={`alert-${msg.type}`} style={{ marginTop: 14 }}>{msg.text}</div>}
          {txHash && (
            <div className="tx-hash" style={{ marginTop: 12 }}>
              ✓ TX: <a href={`https://chainscan.0g.ai/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ color: "var(--teal)", fontFamily: "IBM Plex Mono, monospace" }}>
                {txHash.slice(0, 16)}...
              </a>
            </div>
          )}
        </div>

        {/* Complete task panel */}
        {activeTaskId && (
          <div style={{ background: "#0a1e18", border: "1px solid rgba(45,212,191,0.25)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e8f0fe", marginBottom: 14, fontFamily: "Syne, sans-serif" }}>
              Complete Task #{activeTaskId}
            </div>
            {label({}, "Result Hash (0G Storage)")}
            <input className="input" placeholder="0x... root hash of result" value={resultHash} onChange={e => setResultHash(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-teal btn-sm" onClick={() => completeTask(activeTaskId)} disabled={loading || !resultHash} style={{ flex: 1 }}>
                {loading ? <span className="spin" /> : "Complete & Claim Reward"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTaskId(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Task board */}
      <div style={{ background: "#0d1b2e", border: "1px solid #1e3a5f", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f0fe", fontFamily: "Syne, sans-serif" }}>Task Board</div>
            <div style={{ fontSize: 12, color: "#6b8aad", marginTop: 3, fontFamily: "IBM Plex Mono, monospace" }}>{tasks.length} total tasks</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["all", "Open", "Claimed", "Completed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, border: filter === f ? "1px solid #3b82f6" : "1px solid #1e3a5f", background: filter === f ? "rgba(59,130,246,0.15)" : "transparent", color: filter === f ? "#60a5fa" : "#6b8aad", transition: "all 0.15s" }}>
                {f}
              </button>
            ))}
            <button onClick={loadTasks} style={{ padding: "5px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer", border: "1px solid #1e3a5f", background: "transparent", color: "#6b8aad" }}>↻</button>
          </div>
        </div>

        {loadingTasks ? (
          <div style={{ textAlign: "center", padding: 40 }}><span className="spin" style={{ width: 24, height: 24 }} /></div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed #1e3a5f", borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◎</div>
            <div style={{ fontSize: 14, color: "#6b8aad", marginBottom: 6 }}>No tasks found</div>
            <div style={{ fontSize: 12, color: "#2a4060" }}>Post the first task to get started</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTasks.map((task, i) => (
              <div key={i} style={{ background: "#091422", border: "1px solid #1a3050", borderRadius: 12, padding: "18px 20px", transition: "border-color 0.18s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e8f0fe", marginBottom: 5, fontFamily: "Syne, sans-serif" }}>
                      #{task.id?.toString()} {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 12, color: "#6b8aad", lineHeight: 1.5 }} className="line-clamp-2">{task.description}</div>
                    )}
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.05em", color: STATUS_COLORS[task.status], background: STATUS_BG[task.status], border: `1px solid ${STATUS_BORDER[task.status]}`, flexShrink: 0 }}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #1a3050" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b", fontFamily: "IBM Plex Mono, monospace" }}>
                      {ethers.formatEther(task.reward || 0)} 0G
                    </span>
                    <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "IBM Plex Mono, monospace" }}>
                      {task.poster?.slice(0, 6)}...{task.poster?.slice(-4)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {task.status === 0 && task.poster?.toLowerCase() !== wallet?.toLowerCase() && (
                      <button className="btn btn-teal btn-sm" onClick={() => claimTask(Number(task.id))} disabled={loading}>Claim Task</button>
                    )}
                    {task.status === 1 && task.assignee?.toLowerCase() === wallet?.toLowerCase() && (
                      <button className="btn btn-blue btn-sm" onClick={() => setActiveTaskId(Number(task.id))}>Submit Result</button>
                    )}
                    {task.status === 0 && task.poster?.toLowerCase() === wallet?.toLowerCase() && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelTask(Number(task.id))} disabled={loading}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}