import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SignalAction, SignalStatus, MarketRegime } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formatters ────────────────────────────────────────────────────────────────

export const formatUsd = (value: number | undefined, decimals = 0): string => {
  if (value == null) return "—";
  if (value === 0) return "$0.00";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(decimals)}`;
};

export const formatPrice = (value: number | undefined): string => {
  if (value == null) return "—";
  if (value === 0) return "$0.00";
  if (value < 0.000001) return `$${value.toExponential(2)}`;
  if (value < 0.01) return `$${value.toFixed(7)}`;
  return `$${value.toFixed(4)}`;
};

export const formatPct = (value: number | undefined): string => {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const formatAge = (minutes: number | undefined): string => {
  if (minutes == null) return "—";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${(minutes / 1440).toFixed(1)}d`;
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
};

// ── Action helpers ────────────────────────────────────────────────────────────

export const ACTION_LABEL: Record<SignalAction, string> = {
  BUY:       "BUY",
  WAIT_HIGH: "WAIT ▲",
  WAIT_LOW:  "WAIT ▼",
  IGNORE:    "IGNORE",
  DROPPED:   "DROPPED",
};

export const ACTION_COLOR: Record<SignalAction, string> = {
  BUY:       "text-[#00ff88] border-[#00ff88]/25 bg-[#00ff88]/10",
  WAIT_HIGH: "text-[#ff9500] border-[#ff9500]/25 bg-[#ff9500]/10",
  WAIT_LOW:  "text-[#3b82f6] border-[#3b82f6]/25 bg-[#3b82f6]/10",
  IGNORE:    "text-[#ff4455] border-[#ff4455]/25 bg-[#ff4455]/10",
  DROPPED:   "text-[#6b7280] border-[#6b7280]/25 bg-[#6b7280]/10",
};

export const ACTION_BORDER: Record<SignalAction, string> = {
  BUY:       "border-l-[#00ff88]",
  WAIT_HIGH: "border-l-[#ffaa00]",
  WAIT_LOW:  "border-l-[#00b4ff]",
  IGNORE:    "border-l-[#ff4455]",
  DROPPED:   "border-l-[#6b7280]",
};

export const ACTION_GLOW: Record<SignalAction, string> = {
  BUY:       "shadow-[0_0_16px_rgba(0,255,136,0.12)]",
  WAIT_HIGH: "shadow-[0_0_16px_rgba(255,170,0,0.10)]",
  WAIT_LOW:  "shadow-[0_0_16px_rgba(0,180,255,0.10)]",
  IGNORE:    "",
  DROPPED:   "",
};

// ── Status helpers ────────────────────────────────────────────────────────────

export const STATUS_COLOR: Record<SignalStatus, string> = {
  SCANNING:  "text-violet-400",
  ANALYZING: "text-[#3b82f6]",
  SCORED:    "text-[#00ff88]",
  ERROR:     "text-[#ff3355]",
  TIMEOUT:   "text-[#ff9500]",
};

// ── Grade helpers ─────────────────────────────────────────────────────────────

export const getGrade = (score: number): { grade: string; color: string } => {
  if (score >= 8.5) return { grade: "A+", color: "#00ff88" };
  if (score >= 7.5) return { grade: "A",  color: "#00ff88" };
  if (score >= 6.5) return { grade: "B+", color: "#00e5cc" };
  if (score >= 5.5) return { grade: "B",  color: "#4da6ff" };
  if (score >= 4.5) return { grade: "C+", color: "#ffaa00" };
  if (score >= 3.5) return { grade: "C",  color: "#ff8c00" };
  if (score >= 2.0) return { grade: "D",  color: "#ff6644" };
  return { grade: "F", color: "#ff3355" };
};

// ── Regime helpers ────────────────────────────────────────────────────────────

export const REGIME_COLOR: Record<MarketRegime, string> = {
  BULL:    "text-[#00ff88]",
  GROWTH:  "text-emerald-400",
  NEUTRAL: "text-[#ffaa00]",
  DYING:   "text-[#ff4466]",
};

export const REGIME_BG: Record<MarketRegime, string> = {
  BULL:    "bg-[#00ff88]/10 border-[#00ff88]/20",
  GROWTH:  "bg-emerald-400/10 border-emerald-400/20",
  NEUTRAL: "bg-[#ffaa00]/10 border-[#ffaa00]/20",
  DYING:   "bg-[#ff4466]/10 border-[#ff4466]/20",
};
