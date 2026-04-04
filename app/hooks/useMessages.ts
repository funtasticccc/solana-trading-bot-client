"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import type { IncomingMessage } from "@/app/lib/types";

export const useMessages = () => {
  const [messages, setMessages] = useState<IncomingMessage[]>([]);

  const prepend = useCallback((msg: IncomingMessage) => {
    setMessages((prev) => [msg, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    supabase
      .from("messages")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as IncomingMessage[]);
      });

    const channel = supabase
      .channel("messages-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) =>
        prepend(p.new as IncomingMessage)
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [prepend]);

  return messages;
};
