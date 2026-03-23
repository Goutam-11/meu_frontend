import "server-only";
import prisma from "./db";
import ccxt from "ccxt";
// ccxt exchange map


export const exchangeMap = {
  BINANCE: ccxt.binance,
  BYBIT: ccxt.bybit,
  KRAKEN: ccxt.kraken,
  KUCOIN: ccxt.kucoin,
  DELTA: ccxt.delta,
};

export type ExchangeName = keyof typeof exchangeMap;

export async function getExchangeData(exchangeId: string) {
  if (!exchangeId || typeof exchangeId !== "string") {
    throw new Error("Invalid exchange ID provided");
  }

  const exchangeData = await prisma.exchange.findUnique({
    where: { id: exchangeId },
  });

  if (!exchangeData) {
    throw new Error(`Exchange not found with ID: ${exchangeId}`);
  }

  if (!exchangeData.apiKey || !exchangeData.secret) {
    throw new Error("Exchange API credentials are missing or invalid");
  }

  const exchangeName = exchangeData.name.toUpperCase() as ExchangeName;

  if (!exchangeMap[exchangeName]) {
    throw new Error(`Unsupported exchange type: ${exchangeData.name}`);
  }

  const exchange = new exchangeMap[exchangeName]({
    apiKey: exchangeData.apiKey,
    secret: exchangeData.secret,
    ...((exchangeData.urls?.public && exchangeData.urls.private) && {
      urls: {
        api: {
          public: exchangeData.urls?.public,
          private: exchangeData.urls?.private,
        },
      },
    }
    )});

  if (exchangeData.sandbox) {
    try {
      exchange.setSandboxMode(true);
    } catch {}
  }

  // 🔥 KEY CHANGE: no throwing here
  let positions: unknown[] = [];
  let trades: unknown[] = [];
  let balance: Record<string, unknown> = {};

  let positionsError: string | null = null;
  let tradesError: string | null = null;
  let balanceError: string | null = null;
  // console.log(await exchange.fetchPositions())
  try {
    positions = await exchange.fetchPositions();
  } catch (err) {
    positionsError = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    trades = await exchange.fetchMyTrades();
  } catch (err) {
    tradesError = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    balance = await exchange.fetchBalance();
  } catch (err) {
    balanceError = err instanceof Error ? err.message : "Unknown error";
  }
  
  return {
    positions,
    trades,
    balance,
    positionsError,
    tradesError,
    balanceError,
  };
}