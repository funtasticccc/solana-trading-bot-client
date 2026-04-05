"use client";

import { useLogs } from "@/app/hooks/useLogs";
import type { LogLevel } from "@/app/hooks/useLogs";

const LEVEL_ICON: Record<LogLevel, string>  = { info: "·", success: "✓", warn: "!", error: "×" };
const LEVEL_COLOR: Record<LogLevel, string> = {
  info:    "#768390",
  success: "#3fb950",
  warn:    "#d29922",
  error:   "#f85149",
};
const LEVEL_MSG: Record<LogLevel, string> = {
  info:    "#adbac7",
  success: "#56d364",
  warn:    "#e3b341",
  error:   "#ff7b72",
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0")).join(":");
};

export const LogFeed = () => {
  const logs = useLogs();
  return (
    <div className="w-full md:w-[340px] md:shrink-0" style={{
      display: "flex", flexDirection: "column", height: "100%",
      borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#21262d",
      backgroundColor: "#0a0f16",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: "52px", flexShrink: 0,
        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#30363d", fontFamily: "JetBrains Mono, monospace", fontSize: "14px" }}>{">"}_</span>
          <span style={{ color: "#8b949e", fontWeight: 700, fontSize: "11px", letterSpacing: "0.18em" }}>
            SYSTEM ENGINE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#00ff88",
            boxShadow: "0 0 10px #00ff88",
            display: "inline-block",
          }} />
          <span style={{ color: "#00cc6a", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Entries */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {logs.length === 0 ? (
          <div style={{ color: "#21262d", fontSize: "11px", textAlign: "center", paddingTop: "48px", letterSpacing: "0.15em" }}>
            WAITING FOR ACTIVITY
          </div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "6px 20px",
              backgroundColor: entry.level === "error" ? "rgba(255,51,85,0.03)" : "transparent",
            }}>
              <span style={{
                color: "#545d68", fontSize: "10px", flexShrink: 0,
                fontFamily: "JetBrains Mono, monospace", paddingTop: "1px",
                minWidth: "52px",
              }}>
                {fmt(entry.ts)}
              </span>
              <span style={{
                color: LEVEL_COLOR[entry.level],
                fontSize: "12px", fontWeight: 700, flexShrink: 0, paddingTop: "1px",
              }}>
                {LEVEL_ICON[entry.level]}
              </span>
              <span style={{
                color: LEVEL_MSG[entry.level],
                fontSize: "11px", lineHeight: "1.6",
                fontFamily: "JetBrains Mono, monospace",
                wordBreak: "break-word",
              }}>
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
