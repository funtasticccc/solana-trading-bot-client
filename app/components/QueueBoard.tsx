"use client";

import { useState } from "react";
import { useWaitQueue } from "@/app/hooks/useWaitQueue";
import { formatUsd, formatPrice, timeAgo } from "@/app/lib/utils";
import type { WaitQueueRow, Signal } from "@/app/lib/types";

// ── Copyable CA ───────────────────────────────────────────────────────────────

const CopyCA = ({ ca }: { ca: string }) => {
  const [copied, setCopied] = useState(false);
  const short = `${ca.slice(0, 4)}…${ca.slice(-4)}`;
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(ca).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  return (
    <button onClick={copy} style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 9, fontFamily: "JetBrains Mono, monospace",
      color: copied ? "#00ff88" : "#484f58",
      background: "none", border: "none", padding: 0,
      cursor: "pointer", transition: "color 0.15s",
    }}>
      {short}{copied && " ✓"}
    </button>
  );
};

// ── Confidence bar ────────────────────────────────────────────────────────────

const confColor = (c: number): string => {
  if (c >= 0.75) return "#00ff88";
  if (c >= 0.65) return "#a3e635";
  if (c >= 0.50) return "#ff9500";
  if (c >= 0.30) return "#f59e0b";
  return "#ff4455";
};

const ConfBar = ({ value }: { value: number }) => {
  const color = confColor(value);
  const pct   = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        flex: 1, height: 3, borderRadius: 2,
        backgroundColor: "#21262d", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          backgroundColor: color,
          transition: "width 0.4s ease, background-color 0.4s ease",
          boxShadow: value >= 0.65 ? `0 0 6px ${color}80` : "none",
        }} />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, color,
        fontFamily: "JetBrains Mono, monospace",
        minWidth: 32, textAlign: "right",
      }}>
        {pct}%
      </span>
    </div>
  );
};

// ── Queue row ─────────────────────────────────────────────────────────────────

const QueueRow = ({ row }: { row: WaitQueueRow }) => {
  const name    = row.name ?? null;
  const msLeft  = Math.max(0, new Date(row.expires_at).getTime() - Date.now());
  const minLeft = Math.ceil(msLeft / 60_000);
  const isNear  = row.confidence >= 0.65;
  const accent  = row.action === "WAIT_HIGH" ? "#ff9500" : "#3b82f6";

  return (
    <div style={{
      padding: "10px 14px",
      borderRadius: 8,
      border: `1px solid ${isNear ? `${accent}40` : "#21262d"}`,
      backgroundColor: isNear ? `${accent}08` : "#0d1117",
      marginBottom: 6,
      transition: "all 0.2s",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            backgroundColor: `${accent}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0,
          }}>
            {(name ?? row.ca)[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            {name
              ? <div style={{ fontSize: 12, fontWeight: 700, color: "#e6edf3", marginBottom: 1 }}>{name}</div>
              : <div style={{ fontSize: 10, color: "#484f58", marginBottom: 1 }}>no name</div>
            }
            <CopyCA ca={row.ca} />
          </div>
          {isNear && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: "#00ff88",
              border: "1px solid #00ff8830", borderRadius: 4,
              padding: "2px 6px", letterSpacing: "0.1em",
            }}>
              NEAR ▲
            </span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {row.price != null && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#c9d1d9" }}>
              {formatPrice(row.price)}
            </div>
          )}
          <div style={{ fontSize: 9, color: "#484f58", fontFamily: "JetBrains Mono, monospace" }}>
            ⏱ {minLeft}m
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfBar value={row.confidence} />

      {/* Triggers + metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
          {row.triggers_fired.slice(0, 3).map((t) => (
            <span key={t} style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 4,
              backgroundColor: `${accent}15`, color: accent,
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {t}
            </span>
          ))}
          {row.triggers_fired.length === 0 && (
            <span style={{ fontSize: 9, color: "#30363d", fontFamily: "JetBrains Mono, monospace" }}>
              no triggers yet
            </span>
          )}
        </div>
        <div style={{ fontSize: 9, color: "#484f58", textAlign: "right", flexShrink: 0, fontFamily: "JetBrains Mono, monospace" }}>
          {row.liquidity != null && <div>Liq {formatUsd(row.liquidity)}</div>}
          <div>tick {row.tick_count}</div>
        </div>
      </div>
    </div>
  );
};

// ── Outcome row (graduated / dropped) ────────────────────────────────────────

const OutcomeRow = ({ sig, type }: { sig: Signal; type: "graduated" | "dropped" }) => {
  const name   = sig.token_data?.name ?? null;
  const isGrad = type === "graduated";
  const accent = isGrad ? "#00ff88" : "#6b7280";
  const label  = isGrad
    ? `✓ from ${sig.graduated_from?.replace("_", " ") ?? "WAIT"}`
    : `✕ ${(sig.dropped_reason ?? "unknown").replace(/_/g, " ")}`;
  const ts = isGrad ? sig.scored_at : sig.dropped_at;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 14px",
      borderBottom: "1px solid #161b22",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          backgroundColor: `${accent}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: accent, flexShrink: 0,
        }}>
          {(name ?? sig.ca)[0]?.toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          {name
            ? <div style={{ fontSize: 11, fontWeight: 700, color: isGrad ? "#e6edf3" : "#6b7280", marginBottom: 1 }}>{name}</div>
            : <div style={{ fontSize: 10, color: "#484f58", marginBottom: 1 }}>no name</div>
          }
          <CopyCA ca={sig.ca} />
          <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
            {label}
          </div>
        </div>
      </div>
      {ts && (
        <span style={{ fontSize: 9, color: "#30363d", fontFamily: "JetBrains Mono, monospace", flexShrink: 0, marginLeft: 8 }}>
          {timeAgo(ts)}
        </span>
      )}
    </div>
  );
};

// ── Column ────────────────────────────────────────────────────────────────────

const Column = ({
  title, accent, count, children, last = false,
}: {
  title: string; accent: string; count: number; children: React.ReactNode; last?: boolean;
}) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    borderRight: last ? "none" : "1px solid #21262d", minWidth: "160px",
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 14px", height: 36, flexShrink: 0,
      borderBottom: "1px solid #21262d",
      backgroundColor: "#0a0f16",
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.15em" }}>
        {title}
      </span>
      <span style={{
        fontSize: 10, color: "#484f58",
        fontFamily: "JetBrains Mono, monospace",
      }}>
        {count}
      </span>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
      {children}
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────

const Empty = ({ label }: { label: string }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: 80, gap: 6,
  }}>
    <span style={{ fontSize: 18, color: "#21262d" }}>◈</span>
    <span style={{ fontSize: 10, color: "#30363d", letterSpacing: "0.15em" }}>{label}</span>
  </div>
);

// ── Board ─────────────────────────────────────────────────────────────────────

export const QueueBoard = () => {
  const { high, low, graduated, dropped, loading } = useWaitQueue();

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", width: "100%",
      borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#21262d",
      backgroundColor: "#0a0f16",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "40px", flexShrink: 0,
        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, color: "#30363d" }}>◈</span>
          <span style={{ color: "#8b949e", fontWeight: 700, fontSize: 10, letterSpacing: "0.18em" }}>
            QUEUE BOARD
          </span>
          {!loading && (
            <span style={{
              padding: "2px 8px", borderRadius: 100,
              backgroundColor: "#00ff8812", border: "1px solid #00ff8830",
              color: "#00ff88", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
            }}>
              {high.length + low.length} ACTIVE
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
          <span style={{ color: "#ff9500" }}>▲ {high.length}</span>
          <span style={{ color: "#3b82f6" }}>▼ {low.length}</span>
          <span style={{ color: "#00ff88" }}>✓ {graduated.length}</span>
          <span style={{ color: "#6b7280" }}>✕ {dropped.length}</span>
        </div>
      </div>

      {/* Four columns: DROPPED · WAIT LOW · WAIT HIGH · GRADUATED */}
      <div style={{ display: "flex", flex: 1, overflowX: "auto", overflowY: "hidden" }}>

        {/* DROPPED */}
        <Column title="DROPPED" accent="#6b7280" count={dropped.length}>
          {dropped.length === 0
            ? <Empty label="NONE YET" />
            : dropped.map((s) => <OutcomeRow key={s.id} sig={s} type="dropped" />)}
        </Column>

        {/* WAIT LOW */}
        <Column title="WAIT LOW" accent="#3b82f6" count={low.length}>
          {low.length === 0
            ? <Empty label="NO LOW QUEUE" />
            : low.map((r) => <QueueRow key={r.ca} row={r} />)}
        </Column>

        {/* WAIT HIGH */}
        <Column title="WAIT HIGH" accent="#ff9500" count={high.length}>
          {high.length === 0
            ? <Empty label="NO HIGH QUEUE" />
            : high.map((r) => <QueueRow key={r.ca} row={r} />)}
        </Column>

        {/* GRADUATED */}
        {/* <Column title="GRADUATED" accent="#00ff88" count={graduated.length} last>
          {graduated.length === 0
            ? <Empty label="NONE YET" />
            : graduated.map((s) => <OutcomeRow key={s.id} sig={s} type="graduated" />)}
        </Column> */}

      </div>
    </div>
  );
};
