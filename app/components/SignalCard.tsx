"use client";

import { useState } from "react";
import {
  formatUsd,
  formatPrice,
  formatAge,
  timeAgo,
  getGrade,
} from "@/app/lib/utils";
import { ActionBadge, StatusBadge } from "./StatusBadge";
import type { Signal } from "@/app/lib/types";

const ACCENT: Record<string, string> = {
  BUY: "#00ff88",
  WAIT_HIGH: "#ff9500",
  WAIT_LOW: "#3b82f6",
  IGNORE: "#ff4455",
};

const FALLBACK_ACCENT: Record<string, string> = {
  ANALYZING: "#f59e0b",
  SCORED: "#3b82f6",
  ERROR: "#ff3355",
  TIMEOUT: "#ff3355",
  DEFAULT: "#6b7280",
};

const safe = (v: any, fallback: any = null) =>
  v === undefined || v === null || Number.isNaN(v) ? fallback : v;

/* -------------------- GRADE -------------------- */
const GradeBadge = ({ score }: { score: number }) => {
  const { grade, color } = getGrade(score ?? 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color,
          border: `1px solid ${color}40`,
          background: `${color}15`,
        }}
      >
        {grade}
      </div>
      <span style={{ color, fontSize: 20, fontWeight: 800 }}>
        {Math.round((score ?? 0) * 10)}
      </span>
    </div>
  );
};

/* -------------------- COPY CA -------------------- */
const CopyCA = ({ ca }: { ca: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ca || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <span
      onClick={copy}
      style={{
        fontSize: 10,
        cursor: "pointer",
        color: copied ? "#00ff88" : "#6b7280",
        fontFamily: "monospace",
        userSelect: "all",
        opacity: copied ? 1 : 0.85,
        letterSpacing: "0.3px",
      }}
    >
      {ca || "-"} {copied && "✓"}
    </span>
  );
};

/* -------------------- CARD -------------------- */
export const SignalCard = ({
  signal,
  isSelected,
  onClick,
}: {
  signal: Signal;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const td = signal.token_data;

  const symbol = td?.symbol || signal.ca?.slice(0, 4) || "UNK";
  const name = td?.name;

  const price = safe(td?.onchain?.priceUsd);
  const mc = safe(td?.onchain?.marketCap);
  const liq = safe(td?.onchain?.liquidity?.usd);
  const vol = safe(td?.onchain?.volume?.h24);
  const age = safe(td?.age);
  const d5m = safe(td?.onchain?.priceChange?.m5);
  const d1h = safe(td?.onchain?.priceChange?.h1);

  const hasAnyData =
    price !== null ||
    mc !== null ||
    liq !== null ||
    vol !== null ||
    age !== null;

  const accent =
    (signal.action && ACCENT[signal.action]) ||
    FALLBACK_ACCENT[signal.status] ||
    FALLBACK_ACCENT.DEFAULT;

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1a1f26";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected
          ? "#1a1f26"
          : "#12161c";
      }}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 10,
        border: "1px solid #2a2f36",
        borderLeft: `3px solid ${accent}`,
        background: isSelected ? "#1a1f26" : "#12161c",
        padding: 12,
        marginBottom: 8,
        transition: "all 0.15s ease",
        cursor: "pointer",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `${accent}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 12,
            color: accent,
            flexShrink: 0,
          }}
        >
          {symbol[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {signal.action ? (
              <ActionBadge action={signal.action} />
            ) : (
              <StatusBadge status={signal.status} />
            )}

            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#e6edf3",
              }}
            >
              {name || ""}
            </span>
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#6b7280",
              marginTop: 2,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <CopyCA ca={signal.ca} />
            <span>•</span>
            <span>{signal.source}</span>
            <span>•</span>
            <span>{timeAgo(signal.detected_at)}</span>
          </div>
        </div>

        {(signal.token_data?.aiScore != null || signal.scores) && (
          <GradeBadge
            score={
              signal.token_data?.aiScore ??
              signal.scores?.weighted ??
              0
            }
          />
        )}
      </div>

      {/* BODY */}
      {hasAnyData ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid #1f2933",
          }}
        >
          {/* PRICE + CHANGE */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.2px",
              }}
            >
              {formatPrice(price)}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                fontSize: 10,
                opacity: 0.9,
              }}
            >
              {d5m !== null && (
                <span style={{ color: d5m >= 0 ? "#00ff88" : "#ff3355" }}>
                  5m {d5m >= 0 ? "+" : ""}
                  {d5m}%
                </span>
              )}
              {d1h !== null && (
                <span style={{ color: d1h >= 0 ? "#00ff88" : "#ff3355" }}>
                  1h {d1h >= 0 ? "+" : ""}
                  {d1h}%
                </span>
              )}
            </div>
          </div>

          {/* ONCHAIN ROW */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
              fontSize: 10,
              color: "#9ca3af",
              flexWrap: "wrap",
            }}
          >
            <span>MC {formatUsd(mc)}</span>
            <span>Liq {formatUsd(liq)}</span>
            <span>Vol {formatUsd(vol)}</span>
            <span>Age {formatAge(age)}</span>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, fontSize: 11, color: "#6b7280" }}>
          {signal.status === "ANALYZING" && "Analyzing..."}
          {signal.status === "SCORED" && "Waiting data..."}
          {signal.status === "ERROR" && "Error"}
          {signal.status === "TIMEOUT" && "Timeout"}
        </div>
      )}
    </button>
  );
};