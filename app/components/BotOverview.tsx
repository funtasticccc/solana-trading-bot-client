"use client";

import { useMemo } from "react";
import { useSignals } from "@/app/hooks/useSignals";
import { cn, REGIME_COLOR } from "@/app/lib/utils";
import type { MarketRegime } from "@/app/lib/types";

const REGIME_GLOW: Record<MarketRegime, string> = {
  BULL:    "rgba(0,255,136,0.4)",
  GROWTH:  "rgba(52,211,153,0.4)",
  NEUTRAL: "rgba(255,170,0,0.4)",
  DYING:   "rgba(255,51,85,0.4)",
};

const REGIME_HEX: Record<MarketRegime, string> = {
  BULL:    "#00ff88",
  GROWTH:  "#34d399",
  NEUTRAL: "#ffaa00",
  DYING:   "#ff3355",
};

const Bar = ({ value, total, color }: { value: number; total: number; color: string }) => (
  <div className="flex-1 h-1 bg-[#1b2640] rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: total > 0 ? `${(value / total) * 100}%` : "0%",
        backgroundColor: color,
      }}
    />
  </div>
);

const StatRow = ({
  icon, label, value, color, total,
}: {
  icon: string; label: string; value: number; color: string; total: number;
}) => (
  <div className="flex items-center gap-2">
    <span style={{ color }} className="text-[10px] w-3 text-center shrink-0">{icon}</span>
    <span className="text-zinc-600 text-[10px] w-14 shrink-0 tracking-wide">{label}</span>
    <Bar value={value} total={total} color={color} />
    <span className="text-[11px] font-mono font-bold w-5 text-right shrink-0 tabular-nums" style={{ color }}>
      {value}
    </span>
  </div>
);

export const BotOverview = () => {
  const { signals, loading } = useSignals();

  const stats = useMemo(() => {
    const regime  = signals.find((s) => s.market)?.market as MarketRegime | undefined;
    const total   = signals.length;
    const buys    = signals.filter((s) => s.action === "BUY").length;
    const waitH   = signals.filter((s) => s.action === "WAIT_HIGH").length;
    const waitL   = signals.filter((s) => s.action === "WAIT_LOW").length;
    const ignore  = signals.filter((s) => s.action === "IGNORE").length;
    const scan    = signals.filter((s) => s.status === "SCANNING" || s.status === "ANALYZING").length;
    const scored  = signals.filter((s) => s.status === "SCORED").length;
    const errors  = signals.filter((s) => s.status === "ERROR" || s.status === "TIMEOUT").length;
    return { regime, total, buys, waitH, waitL, ignore, scan, scored, errors };
  }, [signals]);

  const regimeColor = stats.regime ? REGIME_HEX[stats.regime] : "#3d5575";
  const regimeGlow  = stats.regime ? REGIME_GLOW[stats.regime] : "transparent";

  return (
    <div className="flex flex-col h-full border-r border-[#1b2640] w-[220px] shrink-0 bg-[#06090f]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1b2640] shrink-0">
        <div className="flex items-center gap-2">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M8 1L3 8h5l-2 5 6-8H7l1-4z" fill="#9945ff" strokeWidth="0.3" strokeLinejoin="round"/>
          </svg>
          <span className="text-zinc-400 font-semibold text-[10px] tracking-[0.18em] uppercase">Overview</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">

        {/* Regime block */}
        <div className="rounded-md border p-3 flex flex-col gap-1.5"
          style={{
            backgroundColor: `${regimeColor}08`,
            borderColor: `${regimeColor}25`,
          }}
        >
          <span className="text-[9px] tracking-[0.15em] uppercase text-zinc-700">Market Regime</span>
          {stats.regime ? (
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: regimeColor, boxShadow: `0 0 8px ${regimeGlow}` }}
              />
              <span
                className="text-[18px] font-bold tracking-widest uppercase leading-none"
                style={{ color: regimeColor }}
              >
                {stats.regime}
              </span>
            </div>
          ) : (
            <span className="text-zinc-700 text-xs">—</span>
          )}
        </div>

        {/* Signal counts */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] tracking-[0.15em] uppercase text-zinc-700">Signals</span>
            <span className="text-[10px] font-mono font-bold text-zinc-400">{stats.total}</span>
          </div>
          {!loading && (
            <div className="flex flex-col gap-2">
              <StatRow icon="●" label="BUY"    value={stats.buys}   color="#00ff88" total={stats.total} />
              <StatRow icon="▲" label="WAIT ▲" value={stats.waitH}  color="#ffaa00" total={stats.total} />
              <StatRow icon="▼" label="WAIT ▼" value={stats.waitL}  color="#4da6ff" total={stats.total} />
              <StatRow icon="○" label="IGNORE" value={stats.ignore} color="#3d5575" total={stats.total} />
            </div>
          )}
        </div>

        {/* Processing */}
        <div className="flex flex-col gap-1 pt-3 border-t border-[#1b2640]/60">
          <span className="text-[9px] tracking-[0.15em] uppercase text-zinc-700 mb-1">Processing</span>
          <div className="flex flex-col gap-1.5">
            {stats.scan > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-violet-400 animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Scanning
                </span>
                <span className="font-mono text-violet-400">{stats.scan}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                Scored
              </span>
              <span className="font-mono text-zinc-500">{stats.scored}</span>
            </div>
            {stats.errors > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#ff3355] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3355]" />
                  Errors
                </span>
                <span className="font-mono text-[#ff3355]">{stats.errors}</span>
              </div>
            )}
          </div>
        </div>

        {/* System status */}
        <div className="mt-auto pt-3 border-t border-[#1b2640]/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"
              style={{ boxShadow: "0 0 5px rgba(0,255,136,0.6)" }} />
            <span className="text-zinc-600">LIVE · connected</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9945ff]" />
            <span className="text-zinc-600">SOLANA mainnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
