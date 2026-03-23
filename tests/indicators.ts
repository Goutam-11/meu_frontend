import { OHLCV } from "ccxt";

/**
 * EMA for a plain numeric array.
 * Returns an array the same length as input with `null` for indices
 * before the first valid EMA (index < period-1).
 */
export function ema(values: number[], period: number): Array<number | null> {
  
  const result: Array<number | null> = new Array(values.length).fill(null);
  if (values.length < period) return result;

  // seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  let prevEma = sum / period;
  result[period - 1] = prevEma;

  const alpha = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    const val = values[i];
    const current = val * alpha + prevEma * (1 - alpha);
    result[i] = current;
    prevEma = current;
  }

  return result;
}

/**
 * MACD computed from OHLCV array (uses close prices).
 * Returns macd line, signal line, and histogram as arrays aligned with input.
 * Indices that don't have enough data are `null`.
 */
export function macd(ohlcv: OHLCV[], fast = 12, slow = 26, signalPeriod = 9, slice: number = 0) {
  const closes = ohlcv.map(c => c[4] ?? 0);
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);

  const macdLine: Array<number | null> = new Array(closes.length).fill(null);
  let firstMacdIdx = -1;
  for (let i = 0; i < closes.length; i++) {
    if (emaFast[i] != null && emaSlow[i] != null) {
      macdLine[i] = emaFast[i]! - emaSlow[i]!;
      if (firstMacdIdx === -1) firstMacdIdx = i;
    }
  }

  const signal: Array<number | null> = new Array(closes.length).fill(null);
  if (firstMacdIdx !== -1) {
    // compact MACD values starting at firstMacdIdx (no nulls expected there)
    const compact = macdLine.slice(firstMacdIdx).map(x => x ?? 0);
    const compactSignal = ema(compact, signalPeriod); // returns array with nulls for first signalPeriod-1
    for (let i = 0; i < compactSignal.length; i++) {
      signal[firstMacdIdx + i] = compactSignal[i];
    }
  }

  const histogram = macdLine.map((m, i) => (m != null && signal[i] != null ? m - signal[i]! : null));
  if(slice > 0) {
    return {
      closePrices: closes.slice(-slice),
      maCD: macdLine.slice(-slice),
      signal: signal.slice(-slice),
      histogram: histogram.slice(-slice),
      emaFast: emaFast.slice(-slice),
      emaSlow: emaSlow.slice(-slice)
    }
  }
  return { closePrices: closes, maCD: macdLine, signal, histogram, emaFast, emaSlow };
}

/**
 * RSI using Wilder smoothing.
 * Accepts either OHLCV[] or number[] (close prices).
 * Returns array aligned with input; indices < period are `null`.
 */
export function rsi(input: OHLCV[] | number[], period = 14, slice: number = 0): Array<number | null> {
  // normalize to closes[] numbers
  const closes: number[] = Array.isArray(input) && Array.isArray(input[0])
    ? (input as OHLCV[]).map(c => c[4] ?? 0)
    : (input as number[]);

  const result: Array<number | null> = new Array(closes.length).fill(null);
  if (closes.length <= period) return result;

  // initial avg gain/loss (first 'period' deltas i=1..period)
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta > 0) gainSum += delta;
    else lossSum += -delta;
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // first RSI value at index `period`
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  // subsequent RSI values using Wilder smoothing
  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  if(slice > 0) {
    return result.slice(-slice);
  }

  return result;
}
