"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import type { Signal } from "@/app/lib/types";

interface SignalsState {
  signals: Signal[];
  loading: boolean;
  error: string | null;
}

const SignalsContext = createContext<SignalsState>({
  signals: [],
  loading: true,
  error: null,
});

export const SignalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const upsert = useCallback((incoming: Signal) => {
    setSignals((prev) => {
      const idx = prev.findIndex((s) => s.id === incoming.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...incoming };
        return next;
      }
      return [incoming, ...prev];
    });
  }, []);

  useEffect(() => {
    supabase
      .from("signals")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setSignals((data as Signal[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel("signals-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "signals" }, (p) =>
        upsert(p.new as Signal)
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "signals" }, (p) =>
        upsert(p.new as Signal)
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [upsert]);

  return (
    <SignalsContext.Provider value={{ signals, loading, error }}>
      {children}
    </SignalsContext.Provider>
  );
};

export const useSignalsContext = () => useContext(SignalsContext);
