import { cn } from "@/app/lib/utils";
import type { ScoreBreakdown } from "@/app/lib/types";

const ROWS = [
  { key: "risk",      label: "Risk",      bar: "#a371f7" },
  { key: "structure", label: "Structure", bar: "#58a6ff" },
  { key: "onchain",   label: "On-chain",  bar: "#3b82f6" },
  { key: "momentum",  label: "Momentum",  bar: "#ff9500" },
] as const;

const ScoreRow = ({ label, value, bar, max = 5 }: { label: string; value: number; bar: string; max?: number }) => {
  const pct   = Math.max(0, Math.min(100, (Math.abs(value) / max) * 100));
  const isNeg = value < 0;
  const color = isNeg ? "#ff3355" : bar;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ color: "#636e7b", fontSize: "11px", fontFamily: "Inter, sans-serif", width: "70px", flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "4px", backgroundColor: "#21262d", borderRadius: "9px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: "9px",
          backgroundColor: color, transition: "width 0.5s ease",
        }} />
      </div>
      <span style={{
        color: isNeg ? "#ff3355" : "#8b949e",
        fontSize: "11px", fontFamily: "JetBrains Mono, monospace",
        width: "28px", textAlign: "right", flexShrink: 0,
      }}>
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
};

export const ScoreBreakdownPanel = ({ scores, className }: { scores: ScoreBreakdown; className?: string }) => (
  <div className={cn("flex flex-col gap-3", className)}>
    {ROWS.map(({ key, label, bar }) => (
      <ScoreRow key={key} label={label} value={scores[key] as number} bar={bar} />
    ))}
    <div style={{
      borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#21262d",
      paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ color: "#636e7b", fontSize: "11px", fontFamily: "Inter, sans-serif" }}>Weighted Total</span>
      <span style={{
        color: scores.weighted >= 6 ? "#00ff88" : scores.weighted >= 3 ? "#ff9500" : "#636e7b",
        fontSize: "18px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace",
      }}>
        {scores.weighted.toFixed(1)}
      </span>
    </div>
  </div>
);
