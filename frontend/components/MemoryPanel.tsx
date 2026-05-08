"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface Props {
  contract: ethers.Contract | null;
  wallet: string | null;
  isRegistered: boolean;
  onRefresh: () => void;
}

const MEMORY_TYPES = ["Conversation", "Strategy", "Knowledge", "Task History", "Analytics", "Custom"];

export default function MemoryPanel({ contract, wallet, isRegistered, onRefresh }: Props) {
  const [rootHash, setRootHash] = useState("");
  const [memoryType, setMemoryType] = useState("Conversation");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [viewAddress, setViewAddress] = useState("");

  useEffect(() => {
    if (contract && wallet) loadMemories(wallet);
  }, [contract, wallet]);

  async function loadMemories(addr: string) {
    if (!contract || !addr) return;
    setLoadingMemories(true);
    try {
      const mems = await contract.getMemories(addr);
      setMemories([...mems].reverse());
    } catch (e) { console.error(e); }
    setLoadingMemories(false);
  }

  async function anchor() {
    if (!contract || !rootHash) return;
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const tx = await contract.storeMemory(
        rootHash, memoryType, description || "Memory entry",
        size ? parseInt(size) : 0
      );
      setMsg({ type: "info", text: "Anchoring memory hash to 0G Chain..." });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg({ type: "success", text: "Memory anchored permanently on 0G Chain!" });
      setRootHash(""); setDescription(""); setSize("");
      if (wallet) loadMemories(wallet);
      onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  const typeColor: Record<string, string> = {
    Conversation: "var(--accent-bright)",
    Strategy: "var(--teal)",
    Knowledge: "var(--purple)",
    "Task History": "var(--amber)",
    Analytics: "var(--green)",
    Custom: "var(--grey)",
  };

  if (!isRegistered) {
    return (
      <div className="empty">
        <div className="empty-icon">◈</div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--grey)", marginBottom: 8 }}>Register an agent first</div>
        <div style={{ fontSize: 13, color: "var(--dim)" }}>Go to Agent ID tab to create your onchain identity</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
      {/* Left: Anchor form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          background: "#0d1b2e",
          border: "1px solid #1e3a5f",
          borderRadius: 14,
          padding: 24,
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f0fe", fontFamily: "Syne, sans-serif", marginBottom: 4 }}>
              Anchor Memory
            </div>
            <div style={{ fontSize: 12, color: "#6b8aad", fontFamily: "IBM Plex Mono, monospace" }}>
              Store 0G Storage hash permanently onchain
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "#8aa8c8",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.08em", textTransform: "uppercase",
                display: "block", marginBottom: 7,
              }}>
                0G Storage Root Hash *
              </label>
              <input
                className="input"
                placeholder="0x... or Qm..."
                value={rootHash}
                onChange={e => setRootHash(e.target.value)}
                style={{ background: "#0a1628", borderColor: "#1e3a5f", color: "#e8f0fe" }}
              />
            </div>

            <div>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "#8aa8c8",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.08em", textTransform: "uppercase",
                display: "block", marginBottom: 7,
              }}>
                Memory Type
              </label>
              <select
                className="select"
                value={memoryType}
                onChange={e => setMemoryType(e.target.value)}
                style={{ background: "#0a1628", borderColor: "#1e3a5f", color: "#e8f0fe" }}
              >
                {MEMORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "#8aa8c8",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.08em", textTransform: "uppercase",
                display: "block", marginBottom: 7,
              }}>
                Description
              </label>
              <textarea
                className="input"
                placeholder="What is stored in this entry?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                style={{ background: "#0a1628", borderColor: "#1e3a5f", color: "#e8f0fe" }}
              />
            </div>

            <div>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "#8aa8c8",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.08em", textTransform: "uppercase",
                display: "block", marginBottom: 7,
              }}>
                Size (bytes, optional)
              </label>
              <input
                className="input"
                type="number"
                placeholder="e.g. 204800"
                value={size}
                onChange={e => setSize(e.target.value)}
                style={{ background: "#0a1628", borderColor: "#1e3a5f", color: "#e8f0fe" }}
              />
            </div>

            <button
              className="btn btn-teal"
              onClick={anchor}
              disabled={loading || !rootHash}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? <><span className="spin" />Anchoring...</> : "Anchor to 0G Chain →"}
            </button>
          </div>

          {msg && (
            <div className={`alert-${msg.type}`} style={{ marginTop: 14 }}>{msg.text}</div>
          )}
          {txHash && (
            <div className="tx-hash" style={{ marginTop: 12 }}>
              ✓ TX: <a
                href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--teal)" }}
              >
                {txHash.slice(0, 16)}...
              </a>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{
          background: "#0d1b2e",
          border: "1px solid #1e3a5f",
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{
            fontSize: 11, color: "#6b8aad", marginBottom: 14,
            fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            How it works
          </div>
          {[
            { n: "1", text: "Upload data to 0G Storage" },
            { n: "2", text: "Get root hash from SDK" },
            { n: "3", text: "Anchor hash here onchain" },
            { n: "4", text: "Data is permanently verifiable" },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#60a5fa", fontWeight: 700,
                flexShrink: 0, fontFamily: "IBM Plex Mono, monospace",
              }}>{s.n}</span>
              <span style={{ fontSize: 13, color: "#8aa8c8", lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Memory list */}
      <div style={{
        background: "#0d1b2e",
        border: "1px solid #1e3a5f",
        borderRadius: 14,
        padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f0fe", fontFamily: "Syne, sans-serif" }}>
              Memory Vault
            </div>
            <div style={{ fontSize: 12, color: "#6b8aad", marginTop: 3, fontFamily: "IBM Plex Mono, monospace" }}>
              {memories.length} {memories.length === 1 ? "entry" : "entries"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Other agent 0x..."
              value={viewAddress}
              onChange={e => setViewAddress(e.target.value)}
              style={{ width: 200, fontSize: 12, background: "#0a1628", borderColor: "#1e3a5f" }}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={() => viewAddress ? loadMemories(viewAddress) : wallet && loadMemories(wallet)}
            >
              Load
            </button>
          </div>
        </div>

        {loadingMemories ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <span className="spin" style={{ width: 24, height: 24 }} />
          </div>
        ) : memories.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            border: "1px dashed #1e3a5f", borderRadius: 12,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◈</div>
            <div style={{ fontSize: 14, color: "#6b8aad", marginBottom: 6 }}>No memories anchored yet</div>
            <div style={{ fontSize: 12, color: "#2a4060" }}>Upload to 0G Storage then anchor the root hash</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memories.map((m, i) => (
              <div key={i} style={{
                background: "#091422",
                border: "1px solid #1a3050",
                borderRadius: 12,
                padding: "16px 18px",
                transition: "border-color 0.18s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "3px 10px", borderRadius: 6,
                    fontSize: 10, fontWeight: 700,
                    fontFamily: "IBM Plex Mono, monospace",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    color: typeColor[m.memoryType] || "#6b8aad",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${typeColor[m.memoryType] || "#1e3a5f"}30`,
                  }}>
                    {m.memoryType}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "IBM Plex Mono, monospace" }}>
                    {new Date(Number(m.timestamp) * 1000).toLocaleDateString()}
                  </span>
                </div>
                {m.description && (
                  <div style={{ fontSize: 13, color: "#8aa8c8", marginBottom: 10, lineHeight: 1.5 }}>
                    {m.description}
                  </div>
                )}
                <div style={{
                  background: "#060e1a",
                  border: "1px solid #1a3050",
                  borderRadius: 8, padding: "8px 12px",
                  fontFamily: "IBM Plex Mono, monospace", fontSize: 11,
                  color: "#2dd4bf", wordBreak: "break-all",
                }}>
                  {m.rootHash}
                </div>
                {Number(m.size) > 0 && (
                  <div style={{ fontSize: 11, color: "#4a6080", marginTop: 8, fontFamily: "IBM Plex Mono, monospace" }}>
                    Size: {(Number(m.size) / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}