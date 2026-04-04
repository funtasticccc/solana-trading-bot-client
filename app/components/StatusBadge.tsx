import type { SignalAction, SignalStatus } from "@/app/lib/types";
import { ACTION_COLOR, ACTION_LABEL, STATUS_COLOR } from "@/app/lib/utils";
import { cn } from "@/app/lib/utils";

export const ActionBadge = ({ action, className }: { action: SignalAction; className?: string }) => (
  <span className={cn(
    "inline-flex items-center text-[10px] font-bold rounded-lg border tracking-widest uppercase shrink-0 font-mono",
    ACTION_COLOR[action], className
  )} style={{ padding: "4px 14px" }}>
    {ACTION_LABEL[action]}
  </span>
);

const STATUS_LABEL: Record<SignalStatus, string> = {
  SCANNING:  "◈ SCANNING",
  ANALYZING: "◎ ANALYZING",
  SCORED:    "◉ SCORED",
  ERROR:     "✕ ERROR",
  TIMEOUT:   "◷ TIMEOUT",
};

const STATUS_BG: Record<SignalStatus, string> = {
  SCANNING:  "border-violet-500/20 bg-violet-500/8",
  ANALYZING: "border-blue-500/20 bg-blue-500/8",
  SCORED:    "border-[#00ff88]/20 bg-[#00ff88]/8",
  ERROR:     "border-[#ff3355]/20 bg-[#ff3355]/8",
  TIMEOUT:   "border-[#ff9500]/20 bg-[#ff9500]/8",
};

export const StatusBadge = ({ status, className }: { status: SignalStatus; className?: string }) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border shrink-0 font-mono",
    STATUS_COLOR[status], STATUS_BG[status],
    (status === "SCANNING" || status === "ANALYZING") && "animate-pulse",
    className
  )} style={{ padding: "4px 14px" }}>
    {STATUS_LABEL[status]}
  </span>
);
