import ccxt from "ccxt";
import { macd, rsi } from "./indicators";

export async function getOHLCV(timeframe: string, symbol: string, since: number, limit: number = 1000) {
  const exch = new ccxt.binance();
  
  const ohlcv = await exch.fetchOHLCV(symbol, timeframe, since, limit);
  return ohlcv;
}

export async function getIntradayIndicators(timeframe: string = "1m", symbol: string = "BTC/USD", slice: number = 30){
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 86400 * 1000, 500);
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { closePrices, maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    closePrices,
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}
export async function getLongTermIndicators(timeframe: string = "4h", symbol: string = "BTC/USD", slice: number = 30){
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 35 * 86400 * 1000, 1000);
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { closePrices,maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    closePrices,
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}


// const intradata = await getIntradayIndicators("5m","ETH-USDC")
// console.log("Intraday Data: ")
// console.log("Mid prices:", intradata.midPrices)
// console.log("Macd:", intradata.maCD)
// console.log("Signal:", intradata.signal)
// console.log("Histogram:", intradata.histogram)
// console.log("ema 12:", intradata.emaFast)
// console.log("ema 26:", intradata.emaSlow)
// console.log("RSI:", intradata.rSI)


const longTermData = await getLongTermIndicators("4h","ETH/USDC")
console.log("Long Term Data: ")
console.log("closePrices:", longTermData.closePrices)
console.log("Mid prices:", longTermData.midPrices)
console.log("Macd:", longTermData.maCD)
console.log("Signal:", longTermData.signal)
console.log("Histogram:", longTermData.histogram)
console.log("ema 12:", longTermData.emaFast)
console.log("ema 26:", longTermData.emaSlow)
console.log("RSI:", longTermData.rSI)

// console.log(Date.now())