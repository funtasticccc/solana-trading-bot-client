import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "alpha · memecoin-bot",
  description: "Solana memecoin signal intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ height: "100vh", overflow: "hidden" }}>{children}</body>
    </html>
  );
}
