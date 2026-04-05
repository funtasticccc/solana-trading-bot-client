"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import type { WaitQueueRow, Signal } from "@/app/lib/types";

interface WaitQueueState {
  high: WaitQueueRow[];
  low:  WaitQueueRow[];
  /** Recently graduated signals (action=BUY, graduated_from set) */
  graduated: Signal[];
  /** Recently dropped signals */
  dropped: Signal[];
  loading: boolean;
}

export const useWaitQueue = (): WaitQueueState => {
  const queueChannelName  = useRef(`wait-queue-feed-${Math.random().toString(36).slice(2, 8)}`).current;
  const signalChannelName = useRef(`queue-signal-outcomes-${Math.random().toString(36).slice(2, 8)}`).current;
  const [high,       setHigh]       = useState<WaitQueueRow[]>([]);
  const [low,        setLow]        = useState<WaitQueueRow[]>([]);
  const [graduated,  setGraduated]  = useState<Signal[]>([]);
  const [dropped,    setDropped]    = useState<Signal[]>([]);
  const [loading,    setLoading]    = useState(true);

  // ── Upsert a queue row into the correct list ──────────────────────────────
  const upsertRow = useCallback((row: WaitQueueRow) => {
    const apply = (enriched: WaitQueueRow) => {
      const setter = enriched.action === "WAIT_HIGH" ? setHigh : setLow;
      setter((prev) => {
        const idx = prev.findIndex((r) => r.ca === enriched.ca);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...prev[idx], ...enriched };
          return next.sort((a, b) => b.confidence - a.confidence);
        }
        return [enriched, ...prev].sort((a, b) => b.confidence - a.confidence);
      });
    };

    // If symbol/name already present, skip the extra fetch
    if (row.symbol || row.name) { apply(row); return; }

    void supabase
      .from("signals")
      .select("token_data")
      .eq("id", row.signal_id)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        apply({ ...row, symbol: data?.token_data?.symbol ?? null, name: data?.token_data?.name ?? null });
      });
  }, []);

  const removeRow = useCallback((ca: string) => {
    setHigh((p) => p.filter((r) => r.ca !== ca));
    setLow ((p) => p.filter((r) => r.ca !== ca));
  }, []);

  // ── Upsert a signal into graduated/dropped ────────────────────────────────
  const upsertSignal = useCallback((sig: Signal) => {
    if (sig.action === "BUY" && sig.graduated_from) {
      setGraduated((p) => {
        const filtered = p.filter((s) => s.id !== sig.id);
        return [sig, ...filtered];
      });
      // Remove from queue display
      removeRow(sig.ca);
    }
    if (sig.action === "DROPPED") {
      setDropped((p) => {
        const filtered = p.filter((s) => s.id !== sig.id);
        return [sig, ...filtered];
      });
      removeRow(sig.ca);
    }
  }, [removeRow]);

  useEffect(() => {
    // Initial load — wait_queue, enriched with token_data from signals
    supabase
      .from("wait_queue")
      .select("*")
      .then(async ({ data }) => {
        const rows = (data ?? []) as WaitQueueRow[];

        // Batch-fetch signal token_data to populate symbol + name
        const signalIds = [...new Set(rows.map((r) => r.signal_id))];
        let enrichMap = new Map<string, { symbol?: string; name?: string }>();
        if (signalIds.length > 0) {
          const { data: sigs } = await supabase
            .from("signals")
            .select("id, token_data")
            .in("id", signalIds);
          if (sigs) {
            enrichMap = new Map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sigs as any[]).map((s) => [s.id, { symbol: s.token_data?.symbol, name: s.token_data?.name }])
            );
          }
        }

        const enrich = (r: WaitQueueRow): WaitQueueRow => {
          const td = enrichMap.get(r.signal_id);
          return { ...r, symbol: r.symbol ?? td?.symbol ?? null, name: r.name ?? td?.name ?? null };
        };

        setHigh(rows.filter((r) => r.action === "WAIT_HIGH").map(enrich).sort((a, b) => b.confidence - a.confidence));
        setLow (rows.filter((r) => r.action === "WAIT_LOW" ).map(enrich).sort((a, b) => b.confidence - a.confidence));
      });

    // Initial load — graduated signals
    supabase
      .from("signals")
      .select("*")
      .not("graduated_from", "is", null)
      .order("scored_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setGraduated((data ?? []) as Signal[]));

    // Initial load — dropped signals
    supabase
      .from("signals")
      .select("*")
      .eq("action", "DROPPED")
      .order("dropped_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setDropped((data ?? []) as Signal[]);
        setLoading(false);
      });

    // Realtime — wait_queue changes
    const queueChannel = supabase
      .channel(queueChannelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wait_queue" },
        (p) => upsertRow(p.new as WaitQueueRow))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wait_queue" },
        (p) => upsertRow(p.new as WaitQueueRow))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "wait_queue" },
        (p) => removeRow((p.old as WaitQueueRow).ca))
      .subscribe();

    // Realtime — signals (graduation and drop events)
    const signalChannel = supabase
      .channel(signalChannelName)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "signals" },
        (p) => upsertSignal(p.new as Signal))
      .subscribe();

    return () => {
      void supabase.removeChannel(queueChannel);
      void supabase.removeChannel(signalChannel);
    };
  }, [upsertRow, removeRow, upsertSignal]);

  return { high, low, graduated, dropped, loading };
};
