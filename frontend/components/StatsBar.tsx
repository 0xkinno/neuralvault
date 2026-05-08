"use client";

interface StatsBarProps {
  stats: {
    totalAgents: string;
    taskCount: string;
    totalMemoryEntries: string;
    totalRewardsDistributed: string;
  };
}

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Agents", value: stats.totalAgents, icon: "⬡", color: "var(--accent-bright)" },
    { label: "Tasks", value: stats.taskCount, icon: "◎", color: "var(--teal)" },
    { label: "Memories", value: stats.totalMemoryEntries, icon: "◈", color: "var(--purple)" },
    { label: "Rewards Paid", value: stats.totalRewardsDistributed + " OG", icon: "◆", color: "var(--amber)" },
  ];

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(8,15,28,0.6)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "stretch",
      }}>
        {items.map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 12,
            borderRight: i < items.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 16, color: item.color }}>{item.icon}</span>
            <div>
              <div className="font-display" style={{
                fontSize: 18, fontWeight: 800,
                color: item.color, lineHeight: 1,
              }}>{item.value}</div>
              <div style={{
                fontSize: 10, color: "var(--grey)",
                fontFamily: "IBM Plex Mono", letterSpacing: "0.06em",
                textTransform: "uppercase", marginTop: 3,
              }}>{item.label}</div>
            </div>
          </div>
        ))}

        {/* Contract link */}
        <div style={{
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 8,
          borderLeft: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 10, color: "var(--grey)", fontFamily: "IBM Plex Mono" }}>Contract</span>
          
          <a href="https://chainscan-galileo.0g.ai/address/0x7047D67Ef69F40F9340Fd97EDF79276458238cfe"
            className="addr"
            style={{ color: "var(--accent-bright)", textDecoration: "none", fontSize: 11 }}
          >
            0x7047...8cfe ↗
          </a>
        </div>
      </div>
    </div>
  );
}