"use client";

import { useState } from "react";
import { formatUsd, formatPrice, formatPct, formatAge, timeAgo } from "@/app/lib/utils";
import { ActionBadge, StatusBadge } from "./StatusBadge";
import { ScoreBreakdownPanel } from "./ScoreBar";
import type { Signal, ColoredTag } from "@/app/lib/types";
import { getGrade } from "@/app/lib/utils";

/* ── small primitives ─────────────────────────────────────── */

const TagPill = ({ tag }: { tag: ColoredTag }) => {
  if (!Array.isArray(tag)) return null;
  const [label, color] = tag;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "4px 10px", borderRadius: "100px",
      fontSize: "11px", fontWeight: 500,
      color, backgroundColor: `${color}15`,
      borderWidth: "1px", borderStyle: "solid", borderColor: `${color}30`,
      fontFamily: "Inter, sans-serif",
    }}>
      {label}
    </span>
  );
};

const RawBlock = ({ text }: { text: string }) => (
  <div style={{
    fontSize: "12px", color: "#636e7b", lineHeight: 1.7,
    backgroundColor: "#161b22", borderRadius: "10px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
    padding: "14px 16px", maxHeight: "200px", overflowY: "auto",
    fontFamily: "JetBrains Mono, monospace",
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  }}>
    {text.split("\n").map((line, li) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={li}>
          {parts.map((p, pi) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={pi} style={{ color: "#adbac7", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
              : <span key={pi}>{p}</span>
          )}
        </div>
      );
    })}
  </div>
);

const Divider = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0 12px" }}>
    <span style={{
      color: "#636e7b", fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase",
      fontFamily: "Inter, sans-serif", flexShrink: 0,
    }}>
      {label}
    </span>
  </div>
);

const Row = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
    <span style={{ color: "#636e7b", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>{label}</span>
    <span style={{
      color: "#adbac7", fontSize: "12px",
      fontFamily: mono ? "JetBrains Mono, monospace" : "Inter, sans-serif",
    }}>
      {value}
    </span>
  </div>
);

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div style={{
    backgroundColor: "#161b22", borderRadius: "10px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
    padding: "14px 16px",
  }}>
    <div style={{ color: "#636e7b", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", marginBottom: "6px", fontFamily: "Inter, sans-serif" }}>
      {label}
    </div>
    <div style={{ color: "#e6edf3", fontSize: "16px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ color: "#636e7b", fontSize: "10px", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}>{sub}</div>}
  </div>
);

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 0", gap: "10px" }}>
      <span style={{ color: "#636e7b", fontSize: "12px", fontFamily: "Inter, sans-serif", flexShrink: 0 }}>{label}</span>
      <button onClick={copy} style={{
        display: "flex", alignItems: "center", gap: "6px",
        color: copied ? "#00ff88" : "#58a6ff",
        backgroundColor: "transparent", border: "none",
        fontSize: "11px", fontFamily: "JetBrains Mono, monospace",
        cursor: "pointer", 
        transition: "color 0.15s",
        textAlign: "right", wordBreak: "break-all",
      }}>
        <span>{value}</span>
        <span style={{ opacity: 0.6, flexShrink: 0 }}>{copied ? "✓" : "⎘"}</span>
      </button>
    </div>
  );
};

/* ── main component ───────────────────────────────────────── */

export const SignalDetail = ({ signal, onClose }: { signal: Signal; onClose: () => void }) => {
  const td        = signal.token_data;
  const onchain   = td?.onchain;
  const risk      = td?.risk;
  const tradePlan = td?.tradePlan;
  const symbol    = signal.ca;
  const regime    = signal.market;
  const price     = onchain?.priceUsd;
  const mc        = onchain?.marketCap;
  const liq       = onchain?.liquidity?.usd;
  const grade     = signal.scores ? getGrade(signal.scores.weighted) : null;

  const REGIME_COLOR: Record<string, string> = {
    BULL: "#00ff88", GROWTH: "#34d399", NEUTRAL: "#ff9500", DYING: "#ff3355",
  };
  const regimeColor = regime ? (REGIME_COLOR[regime] ?? "#adbac7") : "#adbac7";

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "#0d1117",
      borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#21262d",
      animation: "slide-in 0.18s ease-out",
    }}>

      {/* ── Hero header ── */}
      <div style={{
        padding: "10px 24px 20px",
        background: "linear-gradient(180deg, #161b22 0%, #0d1117 100%)",
        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
        flexShrink: 0,
      }}>
        {/* Top row: close */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#636e7b", backgroundColor: "#21262d",
            border: "none", cursor: "pointer", transition: "all 0.15s",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Token identity */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Symbol + name */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
              <span style={{
                color: "#e6edf3", fontFamily: "JetBrains Mono, monospace",
                fontWeight: 800, fontSize: "14px", letterSpacing: "0.02em",
                wordBreak: "break-all"
              }}>
                {symbol}
              </span>
              {td?.name && (
                <span style={{ color: "#636e7b", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
                  {td.name}
                </span>
              )}
            </div>

            {/* Price */}
            {price != null && (
              <div style={{ marginBottom: "14px" }}>
                <span style={{
                  color: "#c9d1d9", fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600, fontSize: "18px",
                }}>
                  {formatPrice(price)}
                </span>
                {mc != null && (
                  <span style={{ color: "#636e7b", fontSize: "12px", marginLeft: "10px", fontFamily: "JetBrains Mono, monospace" }}>
                    MCAP {formatUsd(mc)}
                  </span>
                )}
              </div>
            )}

            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {signal.action ? <ActionBadge action={signal.action} /> : <StatusBadge status={signal.status} />}
              {regime && (
                <span style={{
                  padding: "4px 10px", borderRadius: "6px",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: regimeColor,
                  backgroundColor: `${regimeColor}12`,
                  borderWidth: "1px", borderStyle: "solid", borderColor: `${regimeColor}25`,
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                  {regime}
                </span>
              )}
              {risk?.confidence && (() => {
                const conf = risk.confidence.toUpperCase();
                const confColor = conf === "HIGH" ? "#00ff88" : conf === "MEDIUM" ? "#ff9500" : "#ff3355";
                return (
                  <span style={{
                    padding: "4px 10px", borderRadius: "6px",
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                    color: confColor,
                    backgroundColor: `${confColor}12`,
                    borderWidth: "1px", borderStyle: "solid", borderColor: `${confColor}25`,
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {conf} CONFIDENCE
                  </span>
                );
              })()}
              {td?.aiScore != null && (() => {
                const aiScoreDisplay = Math.round(td.aiScore * 10);
                const aiColor = aiScoreDisplay >= 70 ? "#00ff88" : aiScoreDisplay >= 40 ? "#ff9500" : "#ff3355";
                return (
                  <span style={{
                    padding: "4px 10px", borderRadius: "6px",
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
                    color: aiColor,
                    backgroundColor: `${aiColor}12`,
                    borderWidth: "1px", borderStyle: "solid", borderColor: `${aiColor}25`,
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    AI SCORE {aiScoreDisplay}/100
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Grade badge */}
          {grade && signal.scores && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              padding: "16px 20px", borderRadius: "12px",
              backgroundColor: `${grade.color}10`,
              borderWidth: "1px", borderStyle: "solid", borderColor: `${grade.color}25`,
              flexShrink: 0,
            }}>
              <span style={{ color: grade.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>
                {grade.grade}
              </span>
              <span style={{ color: grade.color, fontSize: "32px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
                {signal.scores.weighted.toFixed(1)}
              </span>
              <span style={{ color: `${grade.color}60`, fontSize: "9px", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>
                SCORE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 32px" }}>

        {/* Identity */}
        <Divider label="Identity" />
        <div style={{
          backgroundColor: "#161b22", borderRadius: "10px",
          borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: "2px"
        }}>
          <CopyRow label="Contract" value={signal.ca} />
          <Row label="Source"   value={signal.source} />
          <Row label="Detected" value={timeAgo(signal.detected_at) + " ago"} />
          {signal.scored_at && <Row label="Scored" value={timeAgo(signal.scored_at) + " ago"} />}
        </div>

        {/* Market data stat cards */}
        {onchain && (
          <>
            <Divider label="Market Data" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <StatCard label="PRICE"      value={formatPrice(price)} />
              <StatCard label="MARKET CAP" value={formatUsd(mc)} />
              <StatCard label="LIQUIDITY"  value={formatUsd(liq)} />
              <StatCard label="VOL 24H"    value={formatUsd(onchain.volume?.h24)} />
            </div>

            {/* Price changes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {onchain.priceChange?.m5 != null && (
                <div style={{
                  padding: "12px 14px", borderRadius: "10px",
                  backgroundColor: "#161b22",
                  borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
                  textAlign: "center",
                }}>
                  <div style={{ color: "#636e7b", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "6px" }}>5M</div>
                  <div style={{ color: onchain.priceChange.m5 >= 0 ? "#00ff88" : "#ff3355", fontSize: "15px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                    {onchain.priceChange.m5 >= 0 ? "▲" : "▼"} {Math.abs(onchain.priceChange.m5).toFixed(2)}%
                  </div>
                </div>
              )}
              {onchain.priceChange?.h1 != null && (
                <div style={{
                  padding: "12px 14px", borderRadius: "10px",
                  backgroundColor: "#161b22",
                  borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
                  textAlign: "center",
                }}>
                  <div style={{ color: "#636e7b", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "6px" }}>1H</div>
                  <div style={{ color: onchain.priceChange.h1 >= 0 ? "#00ff88" : "#ff3355", fontSize: "15px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                    {onchain.priceChange.h1 >= 0 ? "+" : ""}{onchain.priceChange.h1.toFixed(2)}%
                  </div>
                </div>
              )}
              <div style={{
                padding: "12px 14px", borderRadius: "10px",
                backgroundColor: "#161b22",
                borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
                textAlign: "center",
              }}>
                <div style={{ color: "#636e7b", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "6px" }}>AGE</div>
                <div style={{ color: "#adbac7", fontSize: "14px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                  {formatAge(td?.age)}
                </div>
              </div>
            </div>

            {/* DEX / bonding */}
            <div style={{
              padding: "10px 14px", borderRadius: "8px",
              backgroundColor: onchain.dexMigrated ? "rgba(0,255,136,0.06)" : "rgba(59,130,246,0.06)",
              borderWidth: "1px", borderStyle: "solid",
              borderColor: onchain.dexMigrated ? "rgba(0,255,136,0.2)" : "rgba(59,130,246,0.2)",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "16px" }}>{onchain.dexMigrated ? "✅" : "🔗"}</span>
              <span style={{
                color: onchain.dexMigrated ? "#00ff88" : "#3b82f6",
                fontSize: "12px", fontWeight: 600, fontFamily: "JetBrains Mono, monospace",
              }}>
                {onchain.dexMigrated
                  ? "Migrated to DEX"
                  : `Bonding curve ${td?.bondingCurve?.toFixed(1) ?? "?"}%`}
              </span>
            </div>
          </>
        )}

        {/* Buy/sell pressure */}
        {(onchain?.buys5m != null || onchain?.sells5m != null) && (() => {
          const buys  = onchain.buys5m ?? 0;
          const sells = onchain.sells5m ?? 0;
          const total = buys + sells;
          const buyPct = total > 0 ? (buys / total) * 100 : 50;
          return (
            <>
              <Divider label="Pressure · 5m" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#00ff88", fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 700 }}>
                  ▲ {buys} buys
                </span>
                <span style={{ color: "#636e7b", fontSize: "12px" }}>
                  {sells > 0 ? `${(buys / sells).toFixed(1)}× ratio` : "—"}
                </span>
                <span style={{ color: "#ff3355", fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 700 }}>
                  ▼ {sells} sells
                </span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#21262d", borderRadius: "9px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${buyPct}%`, borderRadius: "9px",
                  background: "linear-gradient(90deg, #00ff88, #3b82f6)",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </>
          );
        })()}

        {/* Holders */}
        {onchain?.holders && (
          <>
            <Divider label="Holders" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <StatCard label="TOTAL"    value={onchain.holders.total?.toLocaleString() ?? "—"} />
              <StatCard label="TOP 10%"  value={onchain.holders.top10Percent != null ? `${onchain.holders.top10Percent.toFixed(1)}%` : "—"} />
              <StatCard label="TOP 1"    value={onchain.holders.top1Percent  != null ? `${onchain.holders.top1Percent.toFixed(2)}%`  : "—"} />
            </div>
          </>
        )}

        {/* Risk */}
        {risk && (
          <>
            <Divider label="Risk Assessment" />
            {risk.overallScore != null && (
              <div style={{
                padding: "14px 16px", borderRadius: "10px", marginBottom: "12px",
                backgroundColor: risk.overallScore >= 70 ? "rgba(0,255,136,0.06)" : risk.overallScore >= 40 ? "rgba(255,149,0,0.06)" : "rgba(255,51,85,0.06)",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: risk.overallScore >= 70 ? "rgba(0,255,136,0.2)" : risk.overallScore >= 40 ? "rgba(255,149,0,0.2)" : "rgba(255,51,85,0.2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ color: "#adbac7", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>Overall Risk Score</span>
                <span style={{
                  color: risk.overallScore >= 70 ? "#00ff88" : risk.overallScore >= 40 ? "#ff9500" : "#ff3355",
                  fontSize: "20px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace",
                }}>
                  {risk.overallScore}<span style={{ fontSize: "12px", opacity: 0.5 }}>/100</span>
                </span>
              </div>
            )}
            <Row label="Dev Type" value={
              <span style={{ color: risk.devType === "SERIAL_RUGGER" ? "#ff3355" : risk.devType === "TRUSTED" ? "#00ff88" : "#adbac7", fontWeight: 600 }}>
                {risk.devType ?? "—"}
              </span>
            } />
            <Row label="Confidence"  value={risk.confidence ?? "—"} />
            {risk.devScore != null && <Row label="Dev Score"    value={`${risk.devScore}/100`} mono />}
            {risk.winRate  != null && <Row label="Dev Win Rate" value={`${risk.winRate.toFixed(0)}%`} mono />}
            {risk.pastTokens && (
              <Row label="Past Tokens" value={
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                  <span style={{ color: "#adbac7" }}>{risk.pastTokens.total ?? "?"} total</span>
                  {" · "}
                  <span style={{ color: "#00ff88" }}>{risk.pastTokens.migrated ?? 0} migrated</span>
                  {" · "}
                  <span style={{ color: "#ff3355" }}>{risk.pastTokens.dead ?? 0} dead</span>
                </span>
              } />
            )}
          </>
        )}

        {/* Score breakdown */}
        {signal.scores && (
          <>
            <Divider label="Score Breakdown" />
            <ScoreBreakdownPanel scores={signal.scores} className="mt-1" />
          </>
        )}

        {/* Trade plan */}
        {tradePlan && (
          <>
            <Divider label="Trade Plan" />
            {tradePlan.suggestedHoldHours != null && (
              <Row label="Suggested Hold" value={`${tradePlan.suggestedHoldHours}h`} mono />
            )}
            {tradePlan.takeProfit && tradePlan.takeProfit.length > 0 && (
              <div style={{ marginTop: "10px", borderRadius: "10px", overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  padding: "8px 14px", backgroundColor: "#161b22",
                  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
                }}>
                  {["TARGET", "MCAP", "MULT", "PROB"].map((h) => (
                    <span key={h} style={{ color: "#636e7b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textAlign: h !== "TARGET" ? "right" : "left" }}>{h}</span>
                  ))}
                </div>
                {tradePlan.takeProfit.map((tp, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    padding: "10px 14px",
                    borderTopWidth: i > 0 ? "1px" : "0", borderTopStyle: "solid", borderTopColor: "#21262d",
                    backgroundColor: i % 2 === 0 ? "transparent" : "#0d1117",
                  }}>
                    <span style={{ color: "#00ff88", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: "12px" }}>TP{i + 1}</span>
                    <span style={{ color: "#adbac7", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", textAlign: "right" }}>{formatUsd(tp.marketCap)}</span>
                    <span style={{ color: "#ff9500", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", textAlign: "right" }}>{tp.multiplier != null ? `×${tp.multiplier}` : "—"}</span>
                    <span style={{ color: "#636e7b", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", textAlign: "right" }}>{tp.probability != null ? `${(tp.probability <= 1 ? tp.probability * 100 : tp.probability).toFixed(0)}%` : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tags */}
        {td?.warnings && td.warnings.length > 0 && (
          <>
            <Divider label="Warnings" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {td.warnings.filter(Array.isArray).map((tag, i) => <TagPill key={i} tag={tag} />)}
            </div>
          </>
        )}
        {td?.strengths && td.strengths.length > 0 && (
          <>
            <Divider label="Strengths" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {td.strengths.filter(Array.isArray).map((tag, i) => <TagPill key={i} tag={tag} />)}
            </div>
          </>
        )}
        {td?.signals && td.signals.length > 0 && (
          <>
            <Divider label="Signals" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {td.signals.filter(Array.isArray).map((tag, i) => <TagPill key={i} tag={tag} />)}
            </div>
          </>
        )}

        {/* Raw data */}
        {signal.scanner_raw && (
          <>
            <Divider label="Scanner Data" />
            <RawBlock text={signal.scanner_raw} />
          </>
        )}
        {signal.solhouse_raw && (
          <>
            <Divider label="AI Analysis" />
            <RawBlock text={signal.solhouse_raw} />
          </>
        )}

        {/* Error */}
        {signal.error && (
          <>
            <Divider label="Error" />
            <div style={{
              padding: "14px 16px", borderRadius: "10px",
              backgroundColor: "#161b22",
              borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,51,85,0.2)",
              color: "#ff3355", fontSize: "12px", lineHeight: 1.7,
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {signal.error}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
