"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import type { Signal } from "@/app/lib/types";

export type LogLevel = "info" | "success" | "warn" | "error";

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  message: string;
}

const label = (s: Signal) => s.token_data?.symbol ?? s.ca.slice(0, 8);

const fromSignal = (s: Signal): LogEntry => {
  const ts = new Date().toISOString();
  const id = `${s.id}-${s.status}-${ts}`;
  switch (s.status) {
    case "SCANNING":
      return { id, ts, level: "info", message: `CA detected from ${s.source} — ${label(s)}` };
    case "ANALYZING":
      return { id, ts, level: "info", message: `soul_scanner queried — ${label(s)}` };
    case "SCORED":
      return {
        id, ts,
        level: s.action === "BUY" ? "success" : "info",
        message: `Scored ${label(s)} → ${s.action ?? "?"} (${s.scores?.weighted?.toFixed(1) ?? "-"})`,
      };
    case "TIMEOUT":
      return { id, ts, level: "warn", message: `Timeout — ${label(s)}` };
    case "ERROR":
      return { id, ts, level: "error", message: `ERR — ${label(s)}: ${s.error ?? "unknown"}` };
    default:
      return { id, ts, level: "info", message: `${s.status} — ${label(s)}` };
  }
};

const MAX = 200;

export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const push = useCallback((e: LogEntry) => {
    setLogs((prev) => [e, ...prev].slice(0, MAX));
  }, []);

  useEffect(() => {
    supabase
      .from("signals")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data?.length) setLogs((data as Signal[]).map(fromSignal).slice(0, MAX));
      });

    const channel = supabase
      .channel("logs-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "signals" }, (p) =>
        push(fromSignal(p.new as Signal))
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "signals" }, (p) =>
        push(fromSignal(p.new as Signal))
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [push]);

  return logs;
};
