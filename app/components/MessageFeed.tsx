"use client";

import { useState } from "react";
import { useMessages } from "@/app/hooks/useMessages";

const SOLANA_CA_RE = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const stripMd = (s: string) => s.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "").trim();

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

/* deterministic hue + initials from channel name */
const channelMeta = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = ((h % 360) + 360) % 360;
  const words = name.replace(/[_\-]/g, " ").split(" ").filter(Boolean);
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return { hue, initials };
};

const CopyableCA = ({ ca }: { ca: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(ca).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <button onClick={copy} style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontFamily: "JetBrains Mono, monospace", fontSize: "10px",
      cursor: "pointer", border: "none", textAlign: "left",
      padding: "3px 8px", borderRadius: "4px",
      color: copied ? "#00ff88" : "#58a6ff",
      backgroundColor: copied ? "rgba(0,255,136,0.08)" : "rgba(88,166,255,0.08)",
      outline: `1px solid ${copied ? "rgba(0,255,136,0.2)" : "rgba(88,166,255,0.15)"}`,
      wordBreak: "break-all", lineHeight: 1.6,
      transition: "color 0.15s, background-color 0.15s, outline 0.15s",
      maxWidth: "100%",
    }}>
      <span style={{ wordBreak: "break-all" }}>{ca}</span>
      <span style={{ flexShrink: 0, opacity: copied ? 1 : 0, transition: "opacity 0.15s" }}>✓</span>
    </button>
  );
};

const renderWithCAs = (text: string) => {
  const parts: Array<{ type: "text" | "ca"; value: string }> = [];
  let last = 0;
  for (const match of text.matchAll(SOLANA_CA_RE)) {
    if (match.index! > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    parts.push({ type: "ca", value: match[0] });
    last = match.index! + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts.map((p, i) =>
    p.type === "ca" ? <CopyableCA key={i} ca={p.value} /> : <span key={i}>{p.value}</span>
  );
};

/* group consecutive messages from same channel */
interface Message { id: string; channel: string; text: string; received_at: string; }
const groupMessages = (msgs: Message[]) => {
  const groups: Array<{ channel: string; messages: Message[] }> = [];
  for (const msg of msgs) {
    const last = groups[groups.length - 1];
    if (last && last.channel === msg.channel) {
      last.messages.push(msg);
    } else {
      groups.push({ channel: msg.channel, messages: [msg] });
    }
  }
  return groups;
};

export const MessageFeed = () => {
  const messages = useMessages();
  const groups   = groupMessages(messages);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      width: "300px", flexShrink: 0,
      borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#21262d",
      backgroundColor: "#0d1117",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: "52px", flexShrink: 0,
        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
        backgroundColor: "#0a0f16",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12v9H9.5L8 13.5 6.5 12H2z" fill="none" stroke="#58a6ff" strokeWidth="1.2" strokeLinejoin="round"/>
            <circle cx="5" cy="7.5" r="1" fill="#58a6ff"/>
            <circle cx="8" cy="7.5" r="1" fill="#58a6ff"/>
            <circle cx="11" cy="7.5" r="1" fill="#58a6ff"/>
          </svg>
          <span style={{ color: "#8b949e", fontWeight: 700, fontSize: "11px", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif" }}>
            LOGCHATS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            backgroundColor: "#58a6ff",
            boxShadow: "0 0 8px rgba(88,166,255,0.7)",
            display: "inline-block",
          }} />
          <span style={{ color: "#545d68", fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
            {messages.length}
          </span>
        </div>
      </div>

      {/* Chat body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: "12px",
          }}>
            <svg width="36" height="36" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.15 }}>
              <path d="M2 3h12v9H9.5L8 13.5 6.5 12H2z" fill="none" stroke="#58a6ff" strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: "#21262d", fontSize: "11px", letterSpacing: "0.15em" }}>NO MESSAGES YET</span>
          </div>
        ) : (
          groups.map((group, gi) => {
            const { hue, initials } = channelMeta(stripMd(group.channel));
            const avatarBg    = `hsl(${hue}, 55%, 28%)`;
            const avatarColor = `hsl(${hue}, 70%, 70%)`;
            const bubbleBg    = `hsl(${hue}, 20%, 13%)`;
            const bubbleBorder = `hsl(${hue}, 25%, 20%)`;

            return (
              <div key={gi} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                {/* Avatar */}
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                  color: avatarColor,
                  backgroundColor: avatarBg,
                  marginTop: "2px",
                }}>
                  {initials}
                </div>

                {/* Bubble column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Sender name + time of first message */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      color: avatarColor,
                      fontSize: "12px", fontWeight: 700,
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: "0.02em",
                    }}>
                      {stripMd(group.channel)}
                    </span>
                    <span style={{ color: "#545d68", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
                      {fmtTime(group.messages[0].received_at)}
                    </span>
                  </div>

                  {/* Message bubbles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {group.messages.map((msg, mi) => (
                      <div key={msg.id} style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: bubbleBg,
                        borderWidth: "1px", borderStyle: "solid", borderColor: bubbleBorder,
                        fontSize: "12px", lineHeight: "1.65",
                        color: "#c9d1d9",
                        wordBreak: "break-word", whiteSpace: "pre-wrap",
                        textAlign: "left",
                      }}>
                        {renderWithCAs(stripMd(msg.text))}
                        {mi > 0 && (
                          <span style={{
                            display: "block", marginTop: "4px",
                            color: "#484f58", fontSize: "10px",
                            fontFamily: "JetBrains Mono, monospace",
                            textAlign: "left",
                          }}>
                            {fmtTime(msg.received_at)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
