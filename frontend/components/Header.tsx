"use client";

interface HeaderProps {
  wallet: string | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({ wallet, connecting, onConnect, onDisconnect }: HeaderProps) {
  const short = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(2,8,16,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--teal))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#020810",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)",
          }}>N</div>
          <div>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--white)", letterSpacing: "0.02em" }}>
              NeuralVault
            </div>
            <div style={{ fontSize: 10, color: "var(--grey)", fontFamily: "IBM Plex Mono", letterSpacing: "0.08em" }}>
              AI AGENT LAYER · 0G CHAIN
            </div>
          </div>
        </div>

        {/* Center badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["0G Storage", "0G Compute", "0G Chain", "Agent ID"].map(t => (
          <span key={t} className="badge badge-blue" style={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}>{t}</span>
          ))}
        </div>

        {/* Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {wallet ? (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "8px 14px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--green)",
                  boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                }} />
                <span className="addr">{short(wallet)}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={onDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="btn btn-blue" onClick={onConnect} disabled={connecting}>
              {connecting ? <><span className="spin" />Connecting...</> : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}