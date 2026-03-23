import type { Trade } from "ccxt";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizeTrade(t: Trade) {
  if (
    !t.timestamp ||
    !t.price ||
    !t.amount ||
    !t.symbol ||
    !t.side ||
    !t.symbol
  ) {
    return null; // drop invalid trade
  }

  return {
    ...t,
    timestamp: t.timestamp,
    price: t.price,
    amount: t.amount,
    symbol: t.symbol,
    cost: t.cost ?? t.price * t.amount,
    fee: {
      cost: t.fee?.cost ?? 0,
    },
  };
}

export function computePnlSeries(trades: Trade[]) {
  const cleanTrades = trades
    .map(normalizeTrade)
    .filter((t): t is NonNullable<typeof t> => t !== null);
  const sorted = [...cleanTrades].sort((a, b) => a.timestamp - b.timestamp);
  let cumPnl = 0;
  const holdings: Record<string, { qty: number; avgCost: number }> = {};

  return sorted.map((t) => {
    const key = t.symbol;
    if (!holdings[key]) holdings[key] = { qty: 0, avgCost: 0 };
    const h = holdings[key];

    if (t.side === "buy") {
      const totalCost = h.qty * h.avgCost + t.cost;
      h.qty += t.amount;
      h.avgCost = h.qty > 0 ? totalCost / h.qty : 0;
    } else {
      const realizedPnl = (t.price - h.avgCost) * t.amount - t.fee.cost;
      cumPnl += realizedPnl;
      h.qty -= t.amount;
    }

    cumPnl -= t.side === "buy" ? t.fee.cost : 0;

    return {
      date: new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pnl: parseFloat(cumPnl.toFixed(2)),
      trade: t.symbol.split("/")[0],
      side: t.side,
    };
  });
}

