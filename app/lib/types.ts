export type ColoredTag = [label: string, color: string, severity?: number];

export type SignalStatus = "SCANNING" | "ANALYZING" | "SCORED" | "ERROR" | "TIMEOUT";
export type SignalAction = "BUY" | "WAIT_HIGH" | "WAIT_LOW" | "IGNORE";
export type MarketRegime = "BULL" | "GROWTH" | "NEUTRAL" | "DYING";

export interface ScoreBreakdown {
  risk: number;
  structure: number;
  onchain: number;
  momentum: number;
  total: number;
  weighted: number;
}

export interface TokenData {
  aiScore?: number;
  symbol?: string;
  address?: string;
  name?: string;
  bondingCurve?: number;
  age?: number;
  smartMoney?: boolean;
  kol?: boolean;
  market?: string;
  risk?: {
    overallScore?: number;
    devType?: string;
    confidence?: string;
    devScore?: number;
    winRate?: number;
    pastTokens?: { total?: number; migrated?: number; dead?: number };
  };
  onchain?: {
    priceUsd?: number;
    marketCap?: number;
    liquidity?: { usd?: number };
    volume?: { m5?: number; m15?: number; h1?: number; h24?: number };
    priceChange?: { m5?: number; m15?: number; h1?: number };
    holders?: { total?: number; top10Percent?: number; top1Percent?: number };
    buys5m?: number;
    sells5m?: number;
    dexMigrated?: boolean;
  };
  tradePlan?: {
    entry?: Record<string, unknown>;
    takeProfit?: Array<{ multiplier?: number; marketCap?: number; probability?: number }>;
    stopLoss?: Record<string, unknown>;
    suggestedHoldHours?: number;
  };
  warnings?: ColoredTag[];
  strengths?: ColoredTag[];
  signals?: ColoredTag[];
  tags?: ColoredTag[];
  [key: string]: unknown;
}

export interface Signal {
  id: string;
  ca: string;
  source: string;
  raw_text: string;
  detected_at: string;
  status: SignalStatus;
  scanner_raw?: string | null;
  solhouse_raw?: string | null;
  token_data?: TokenData | null;
  scores?: ScoreBreakdown | null;
  market?: MarketRegime | null;
  action?: SignalAction | null;
  scored_at?: string | null;
  error?: string | null;
}

export interface IncomingMessage {
  id: string;
  channel: string;
  text: string;
  received_at: string;
}
