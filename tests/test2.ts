type Candle = {
  time: number;     // Unix timestamp (ms)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

async function fetchYahooOHLCV(
  symbol: string,
  interval: string,   // '1m', '5m', '15m', '1h', '1d', etc.
  range: string       // e.g. '7d', '1mo', '3mo'
): Promise<Candle[]> {
  // Construct the Yahoo Finance chart URL
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible)", // avoid simple bot blocks
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed: ${response.status}`);
  }

  const json = await response.json();

  // If Yahoo returns no valid result, bail
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error("No chart data returned");
  }

  const timestamps: number[] = result.timestamp;
  const quote = result.indicators.quote?.[0];

  if (!timestamps || !quote) {
    throw new Error("Incomplete OHLCV data");
  }

  const candles: Candle[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const o = quote.open?.[i];
    const h = quote.high?.[i];
    const l = quote.low?.[i];
    const c = quote.close?.[i];
    const v = quote.volume?.[i];

    // Skip missing data points
    if (o == null || h == null || l == null || c == null || v == null) continue;

    candles.push({
      time: timestamps[i] * 1000, // convert to ms
      open: o,
      high: h,
      low: l,
      close: c,
      volume: v,
    });
  }

  return candles;
}

(async () => {
  try {
    // Indian symbol example — use .NS suffix for NSE
    const data1m = await fetchYahooOHLCV("RELIANCE.NS", "1m", "1d");
    console.log("1m candles:", data1m.slice(-30));
    
    const data4h = await fetchYahooOHLCV("RELIANCE.NS", "4h", "1d");
    console.log("4h candles:", data4h);

  } catch (err) {
    console.error(err);
  }
})();
