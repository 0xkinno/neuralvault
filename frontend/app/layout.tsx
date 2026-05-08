import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralVault — AI Agent Command Center on 0G Chain",
  description: "The onchain identity, memory, and coordination layer for autonomous AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  );
}