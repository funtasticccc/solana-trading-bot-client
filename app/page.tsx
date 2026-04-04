export const dynamic = "force-dynamic";

import { SignalFeed } from "@/app/components/SignalFeed";
import { LogFeed } from "@/app/components/LogFeed";
import { MessageFeed } from "@/app/components/MessageFeed";

export default function Home() {
  return (
    <main style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      backgroundColor: "#0d1117",
    }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: "52px", flexShrink: 0,
        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
        backgroundColor: "#0a0f16",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M8 1L3 8h5l-2 5 6-8H7l1-4z" fill="#9945ff"/>
            </svg>
            <span style={{
              color: "#e6edf3", fontWeight: 700, fontSize: "14px",
              letterSpacing: "0.2em", fontFamily: "Inter, sans-serif",
            }}>
              SOLANA TRADING BOT
            </span>
          </div>
          <span style={{
            padding: "4px 14px", borderRadius: "100px",
            background: "linear-gradient(135deg, rgba(153,69,255,0.18), rgba(59,130,246,0.12))",
            borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(153,69,255,0.28)",
            color: "#a371f7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em",
            fontFamily: "Inter, sans-serif",
          }}>
            ALPHA AI
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "11px", fontFamily: "Inter, sans-serif" }}>
          <span style={{ color: "#30363d", letterSpacing: "0.1em" }}>SIGNAL INTELLIGENCE</span>
          <div style={{ width: "1px", height: "16px", backgroundColor: "#21262d" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#484f58", letterSpacing: "0.1em" }}>ENGINE:</span>
            <span style={{ color: "#00ff88", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>LIVE</span>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: "#00ff88",
              boxShadow: "0 0 12px rgba(0,255,136,0.9)",
              display: "inline-block",
            }} />
          </div>
        </div>
      </header>

      {/* Panels */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <MessageFeed />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <SignalFeed />
        </div>
        <LogFeed />
      </div>
    </main>
  );
}
