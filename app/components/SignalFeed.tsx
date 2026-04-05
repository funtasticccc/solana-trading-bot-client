"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { SignalCard } from "./SignalCard";
import { SignalDetail } from "./SignalDetail";
import { useSignals } from "@/app/hooks/useSignals";
import { cn } from "@/app/lib/utils";
import type { Signal, SignalAction } from "@/app/lib/types";

const ACTIONS: Array<SignalAction | "ALL"> = ["ALL", "BUY", "WAIT_HIGH", "WAIT_LOW", "DROPPED", "IGNORE"];
const LABEL: Record<SignalAction | "ALL", string> = {
  ALL: "All", BUY: "Buy", WAIT_HIGH: "Wait ▲", WAIT_LOW: "Wait ▼", IGNORE: "Ignore", DROPPED: "Dropped",
};
const ACTIVE_STYLE: Record<SignalAction | "ALL", { color: string; bg: string; border: string }> = {
  ALL:       { color: "#c9d1d9", bg: "#21262d",   border: "#30363d"   },
  BUY:       { color: "#00ff88", bg: "#00ff8812", border: "#00ff8830" },
  WAIT_HIGH: { color: "#ff9500", bg: "#ff950012", border: "#ff950030" },
  WAIT_LOW:  { color: "#3b82f6", bg: "#3b82f612", border: "#3b82f630" },
  IGNORE:    { color: "#ff4455", bg: "#ff445512", border: "#ff445530" },
  DROPPED:   { color: "#6b7280", bg: "#6b728012", border: "#6b728030" },
};

export const SignalFeed = () => {
  const { signals, loading, error } = useSignals();
  const [selected, setSelected]   = useState<Signal | null>(null);
  const [filter, setFilter]       = useState<SignalAction | "ALL">("ALL");
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => filter === "ALL" ? signals : signals.filter((s) => s.action === filter),
    [signals, filter]
  );

  const countFor = (a: SignalAction | "ALL") =>
    a === "ALL" ? signals.length : signals.filter((s) => s.action === a).length;

  const scanning = signals.filter((s) => s.status === "SCANNING" || s.status === "ANALYZING").length;

  useEffect(() => {
    if (!selected) return;
    const updated = signals.find((s) => s.id === selected.id);
    if (updated) setSelected(updated);
  }, [signals, selected]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    if (panelOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [panelOpen]);

  const openDetail  = (s: Signal) => { setSelected(s); setPanelOpen(true); };
  const closeDetail = () => { setPanelOpen(false); setTimeout(() => setSelected(null), 200); };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
      <span style={{ fontSize: "32px", color: "#21262d" }}>◈</span>
      <span style={{ color: "#484f58", fontSize: "11px", letterSpacing: "0.2em" }}>CONNECTING...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#ff3355", fontSize: "12px" }}>
      ERR: {error}
    </div>
  );

  return (
    <div ref={containerRef} style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>

        {/* Panel header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", height: "52px", flexShrink: 0,
          borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
          backgroundColor: "#0d1117",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M8 1L3 8h5l-2 5 6-8H7l1-4z" fill="#ff9500"/>
            </svg>
            <span style={{ color: "#8b949e", fontWeight: 700, fontSize: "11px", letterSpacing: "0.18em" }}>
              LIVE SIGNALS FEED
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {scanning > 0 && (
              <span style={{ color: "#a371f7", fontSize: "11px", letterSpacing: "0.05em" }}>
                ◈ {scanning} scanning
              </span>
            )}
            <span style={{
              color: "#484f58", fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {signals.length} active
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div
          className="[&::-webkit-scrollbar]:hidden"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 16px",
            borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#161b22",
            backgroundColor: "#0d1117",
            flexShrink: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {ACTIONS.map((a) => {
            const count  = countFor(a);
            const active = filter === a;
            const s      = ACTIVE_STYLE[a];
            return (
              <button key={a} onClick={() => setFilter(a)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "8px",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: active ? s.border : "transparent",
                backgroundColor: active ? s.bg : "transparent",
                color: active ? s.color : "#768390",
                fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "Inter, sans-serif",
                flexShrink: 0, whiteSpace: "nowrap",
              }}>
                {LABEL[a]}
                {count > 0 && (
                  <span style={{
                    color: active ? `${s.color}90` : "#545d68",
                    fontSize: "11px", fontWeight: 500,
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards list (Infinite Scroll Area) */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px",
          display: "flex", flexDirection: "column", gap: "12px",
          backgroundColor: "#0d1117",
        }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "16px" }}>
              <span style={{ fontSize: "36px", color: "#161b22" }}>◈</span>
              <span style={{ color: "#30363d", fontSize: "11px", letterSpacing: "0.2em" }}>NO SIGNALS</span>
            </div>
          ) : (
            filtered.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                isSelected={selected?.id === signal.id}
                onClick={() => openDetail(signal)}
              />
            ))
          )}
        </div>


      </div>

      {/* Detail panel Backdrop */}
      {panelOpen && (
        <div 
          onClick={closeDetail}
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
          style={{ animation: "fade-in 0.2s ease-out" }}
        />
      )}

      {/* Detail panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[560px] transition-transform duration-300 ease-in-out z-50 shadow-2xl",
        panelOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {selected && <SignalDetail signal={selected} onClose={closeDetail} />}
      </div>
    </div>
  );
};
