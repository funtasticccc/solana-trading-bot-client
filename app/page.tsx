"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { SignalFeed } from "@/app/components/SignalFeed";
import { LogFeed } from "@/app/components/LogFeed";
import { MessageFeed } from "@/app/components/MessageFeed";
import { QueueBoard } from "@/app/components/QueueBoard";

type Tab = "signals" | "chat" | "logs" | "queue";

const TABS: { id: Tab; label: string }[] = [
  { id: "signals", label: "Signals" },
  { id: "chat",    label: "Chat"    },
  { id: "logs",    label: "Logs"    },
  { id: "queue",   label: "Queue"   },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("signals");

  return (
    <main className="dashboard-main" style={{
      height: "100vh",
      overflowY: "scroll",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#0d1117",
    }}>

      {/* ── Screen 1: header + panels ─────────────────────────── */}
      <section style={{ height: "100vh", flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(12px, 4vw, 28px)", height: "52px", flexShrink: 0,
          borderBottom: "1px solid #21262d",
          backgroundColor: "#0a0f16",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M8 1L3 8h5l-2 5 6-8H7l1-4z" fill="#9945ff"/>
              </svg>
              <span style={{
                color: "#e6edf3", fontWeight: 700, fontSize: "clamp(11px, 2.5vw, 14px)",
                letterSpacing: "0.2em", fontFamily: "Inter, sans-serif",
              }}>
                SOLANA TRADING BOT
              </span>
            </div>
            <span className="hidden sm:inline-flex" style={{
              padding: "4px 14px", borderRadius: "100px",
              background: "linear-gradient(135deg, rgba(153,69,255,0.18), rgba(59,130,246,0.12))",
              border: "1px solid rgba(153,69,255,0.28)",
              color: "#a371f7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em",
              fontFamily: "Inter, sans-serif",
            }}>
              ALPHA AI
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "11px", fontFamily: "Inter, sans-serif" }}>
            <span className="hidden lg:inline" style={{ color: "#30363d", letterSpacing: "0.1em" }}>SIGNAL INTELLIGENCE</span>
            <div className="hidden lg:block" style={{ width: "1px", height: "16px", backgroundColor: "#21262d" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="hidden sm:inline" style={{ color: "#484f58", letterSpacing: "0.1em" }}>ENGINE:</span>
              <span style={{ color: "#00ff88", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>LIVE</span>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "#00ff88", boxShadow: "0 0 12px rgba(0,255,136,0.9)",
                display: "inline-block",
              }} />
            </div>
          </div>
        </header>

        {/* Mobile tab bar */}
        <nav className="flex md:hidden" style={{
          flexShrink: 0,
          borderBottom: "1px solid #21262d",
          backgroundColor: "#0a0f16",
        }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: "10px 4px",
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                border: "none", backgroundColor: "transparent",
                color: tab === id ? "#e6edf3" : "#484f58",
                borderBottom: tab === id ? "2px solid #9945ff" : "2px solid transparent",
                cursor: "pointer", transition: "color 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Desktop: Three panels side by side */}
        <div className="hidden md:flex" style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <MessageFeed />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <SignalFeed />
          </div>
          <LogFeed />
        </div>

        {/* Mobile: Active tab panel */}
        <div className="flex flex-col md:hidden" style={{ flex: 1, overflow: "hidden" }}>
          {tab === "signals" && <SignalFeed />}
          {tab === "chat"    && <MessageFeed />}
          {tab === "logs"    && <LogFeed />}
          {tab === "queue"   && <QueueBoard />}
        </div>

      </section>

      {/* ── Screen 2: Queue Board (desktop only) ─────────────── */}
      <section className="hidden md:flex" style={{ height: "100vh", flexShrink: 0, flexDirection: "column", overflow: "hidden" }}>
        <QueueBoard />
      </section>

    </main>
  );
}
