"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface Props {
  contract: ethers.Contract | null;
  wallet: string | null;
  isRegistered: boolean;
  onRefresh: () => void;
}

export default function PaymentPanel({ contract, wallet, isRegistered, onRefresh }: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function sendPayment() {
    if (!contract || !recipient || !amount) return;
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.payAgent(recipient, { value: amountWei });
      setMsg({ type: "info", text: "Broadcasting payment on 0G Chain..." });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setMsg({ type: "success", text: `Sent ${amount} OG to ${recipient.slice(0, 8)}...` });
      setRecipient(""); setAmount("");
      onRefresh();
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }

  if (!isRegistered) {
    return (
      <div className="empty">
        <div className="empty-icon">◆</div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--grey)", marginBottom: 8 }}>Register an agent first</div>
        <div style={{ fontSize: 13, color: "var(--dim)" }}>Go to Agent ID tab to create your onchain identity</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 20 }}>
      {/* Left: Send payment */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card card-accent" style={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◆</div>
            <div className="section-title" style={{ marginBottom: 6 }}>Send Payment</div>
            <div style={{ fontSize: 12, color: "var(--grey)", fontFamily: "IBM Plex Mono" }}>
              Direct agent-to-agent transfer on 0G Chain
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Recipient Agent Address *</label>
              <input
                className="input"
                placeholder="0x..."
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Amount (OG) *</label>
              <input
                className="input"
                type="number"
                placeholder="0.01"
                step="0.001"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <button
              className="btn btn-blue btn-lg"
              onClick={sendPayment}
              disabled={loading || !recipient || !amount}
              style={{ width: "100%", marginTop: 8 }}
            >
              {loading ? <><span className="spin" />Sending...</> : "Send OG Payment →"}
            </button>
          </div>

          {msg && <div className={`alert-${msg.type}`} style={{ marginTop: 14 }}>{msg.text}</div>}
          {txHash && (
            <div className="tx-hash">
              ✓ TX: <a
                href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--teal)" }}
              >
                {txHash.slice(0, 20)}...{txHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right: Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card card-teal" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 16, fontSize: 15 }}>Payment Flow</div>
          {[
            { icon: "1", title: "Direct Transfer", desc: "Payments go directly agent-to-agent. No intermediary, no delay." },
            { icon: "2", title: "Logged Onchain", desc: "Every payment emits an event permanently recorded on 0G Chain." },
            { icon: "3", title: "Reputation Updated", desc: "Recipient's totalEarned score updates automatically." },
            { icon: "4", title: "Instant Settlement", desc: "0G Chain finalizes in under 1 second." },
          ].map(s => (
            <div key={s.icon} style={{
              display: "flex", gap: 14, marginBottom: 16,
              paddingBottom: 16, borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(45,212,191,0.1)",
                border: "1px solid rgba(45,212,191,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "var(--teal)", fontWeight: 700, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--white)", marginBottom: 3, fontFamily: "Syne" }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--grey)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, color: "var(--grey)", marginBottom: 12, fontFamily: "IBM Plex Mono", letterSpacing: "0.06em" }}>
            YOUR WALLET
          </div>
          <div className="addr" style={{ marginBottom: 8 }}>{wallet}</div>
          <a
            href={`https://chainscan-galileo.0g.ai/address/${wallet}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            View on 0G Explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}