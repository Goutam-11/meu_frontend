"use client";
import { useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Activity,
  ChevronsUpDown,
  Check,
  DollarSign,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, computePnlSeries } from "@/lib/utils";
import { Exchange } from "@/generated/prisma/client";
import { useSuspenseExchanges } from "../hooks/use-exchange";
import { useQuery } from "@tanstack/react-query";
import { makeQueryClient } from "@/trpc/query-client";
import type { Balances, Position, Trade } from "ccxt";

// Type definitions
interface APIError extends Error {
  code?: string;
  status?: number;
  details?: string;
}
interface ExchangePosition {
  symbol?: string;
  unrealizedPnl?: number;
  marginMode?: string;
  [key: string]: unknown;
}

interface ExchangeTrade {
  symbol?: string;
  side?: string;
  type?: string;
  price?: number;
  amount?: number;
  cost?: number;
  fee?: { cost: number };
  takerOrMaker?: string;
  [key: string]: unknown;
}

interface ExchangeBalance {
  [key: string]: {
    free?: number;
    used?: number;
    total?: number;
  };
}

interface ExchangeData {
  positions: Position[];
  trades: Trade[];
  balance: Balances;
  warnings?: string[];
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// Error handling component
interface ErrorAlertProps {
  error: Error | null;
  data: ExchangeData | undefined;
  errorDismissed: boolean;
  setErrorDismissed: (dismissed: boolean) => void;
  refetch: () => void;
}

const ErrorAlert = ({
  error,
  data,
  errorDismissed,
  setErrorDismissed,
  refetch,
}: ErrorAlertProps) => {
  if (!error || errorDismissed) return null;

  const apiError = error as APIError;
  const errorCode = apiError.code || "UNKNOWN_ERROR";
  const errorDetails = apiError.details;
  const statusCode = apiError.status;

  let errorTitle = "Failed to Load Exchange Data";
  let errorDescription = error.message;

  switch (errorCode) {
    case "EXCHANGE_NOT_FOUND":
      errorTitle = "Exchange Not Found";
      errorDescription =
        "The selected exchange configuration could not be found. Please check your settings.";
      break;
    case "AUTH_ERROR":
      errorTitle = "Authentication Error";
      errorDescription =
        "Failed to authenticate with the exchange. Check your API credentials.";
      break;
    case "TIMEOUT":
      errorTitle = "Request Timeout";
      errorDescription =
        "The exchange API took too long to respond. Please try again.";
      break;
    case "UNSUPPORTED_EXCHANGE":
      errorTitle = "Unsupported Exchange";
      errorDescription = "This exchange type is not currently supported.";
      break;
    case "ALL_FETCHES_FAILED":
      errorTitle = "Cannot Retrieve Data";
      errorDescription =
        "Unable to fetch any data from the exchange. Check your connection and API credentials.";
      break;
    case "INVALID_ID":
      errorTitle = "Invalid Exchange ID";
      errorDescription = "The exchange ID is invalid or missing.";
      break;
    default:
      if (statusCode === 404) {
        errorTitle = "Exchange Not Found";
        errorDescription = "The selected exchange could not be found.";
      } else if (statusCode === 503) {
        errorTitle = "Service Unavailable";
        errorDescription =
          "The exchange service is temporarily unavailable. Please try again later.";
      } else if (statusCode === 504) {
        errorTitle = "Gateway Timeout";
        errorDescription =
          "The exchange API gateway timed out. Please try again.";
      }
  }

  return (
    <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">{errorTitle}</h3>
            <p className="text-sm text-destructive/80 mt-1">
              {errorDescription}
            </p>
            {errorDetails && (
              <p className="text-xs text-destructive/60 mt-2">{errorDetails}</p>
            )}
            {data?.warnings && (
              <div className="mt-2">
                <p className="text-xs font-medium text-destructive/80">
                  Warnings:
                </p>
                <ul className="text-xs text-destructive/70 mt-1 space-y-1">
                  {data.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setErrorDismissed(true)}
          className="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setErrorDismissed(false);
            refetch();
          }}
          className="border-destructive/30 hover:bg-destructive/5"
        >
          Retry
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setErrorDismissed(true)}
          className="text-destructive/80 hover:text-destructive"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
    <div className="space-y-4">
      <div className="h-12 bg-secondary rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-secondary rounded-lg animate-pulse" />
    </div>
  </div>
);

export function ExchangeDashboard() {
  const { data: exchanges } = useSuspenseExchanges();
  const [open, setOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>(
    exchanges[0],
  );
  const [errorDismissed, setErrorDismissed] = useState(false);
  const queryClient = makeQueryClient();

  const handleHover = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["exchange", id],
      queryFn: () =>
        fetch(`/api/exchange/${id}`).then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        }),
    });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["exchange", selectedExchange.id],
    queryFn: async () => {
      const res = await fetch(`/api/exchange/${selectedExchange.id}`);

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Failed to fetch exchange data";
        const errorCode = errorData.code || "UNKNOWN_ERROR";

        const err = new Error(errorMessage) as APIError;
        err.code = errorCode;
        err.status = res.status;
        err.details = errorData.details;
        throw err;
      }

      const jsonData = await res.json();

      // Log any warnings from the server
      if (jsonData.warnings && Array.isArray(jsonData.warnings)) {
        console.warn("Exchange data warnings:", jsonData.warnings);
      }

      return jsonData;
    },
    enabled: !!selectedExchange.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 5000,
    staleTime: 0,
    gcTime: 0,
  });

  const safeData: ExchangeData = useMemo(
    () => ({
      balance: (data?.balance as Balances) ?? {},
      positions: (data?.positions as Position[]) ?? [],
      trades: (data?.trades as Trade[]) ?? [],
    }),
    [data],
  );

  const ignoreKeys = ["info", "free", "used", "total"];

  const pnlsafeData = useMemo(
    () => computePnlSeries((safeData?.trades as Trade[]) ?? []),
    [safeData],
  );
  const totalPnl =
    pnlsafeData.length > 0 ? pnlsafeData[pnlsafeData.length - 1].pnl : 0;
  const isPnlPositive = totalPnl >= 0;

  const totalUnrealizedPnl =
    safeData?.positions?.reduce(
      (sum: number, p: Position) => sum + (p.info.unrealized_pnl ?? 0),
      0,
    ) ?? 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full w-full rounded-b-2xl bg-background p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          error={error as Error}
          data={data}
          errorDismissed={errorDismissed}
          setErrorDismissed={setErrorDismissed}
          refetch={refetch}
        />
      )}

      {/* Header with Exchange Selector */}
      <motion.header
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center border shadow-inner shrink-0">
            <ArrowUpDown className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Exchange Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor positions, trades & portfolio across connected exchanges
            </p>
          </div>
        </div>

        {/* Exchange Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[220px] justify-between"
            >
              {selectedExchange.name}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search exchange..." />
              <CommandList>
                <CommandEmpty>No exchange found.</CommandEmpty>
                <CommandGroup>
                  {exchanges.map((ex) => (
                    <CommandItem
                      key={ex.id}
                      value={ex.name}
                      onMouseEnter={() => handleHover(ex.id)}
                      onSelect={() => {
                        setSelectedExchange(ex);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedExchange.id === ex.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {ex.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </motion.header>

      {/* Account & Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Balance",
            icon: Wallet,
            value: safeData?.balance.USD.total ?? 0,
            suffix: "USD",
          },
          {
            title: "Unrealized PnL",
            icon: totalUnrealizedPnl >= 0 ? TrendingUp : TrendingDown,
            value: `${totalUnrealizedPnl >= 0 ? "+" : ""}${totalUnrealizedPnl}`,
            suffix: "USDT",
            suffixColor:"text-primary",
            valueColor:
              totalUnrealizedPnl >= 0
                ? "text-green-500"
                : "text-destructive",
          },
          {
            title: "Realized PnL",
            icon: DollarSign,
            value: `${totalPnl.toFixed(2)}`,
            suffix: "USDT",
            suffixColor: isPnlPositive
              ? "text-status-running"
              : "text-destructive",
            valueColor: isPnlPositive
              ? "text-status-running"
              : "text-destructive",
          },
          {
            title: "Open Positions",
            icon: Activity,
            value: String(safeData?.positions?.length ?? 0),
            suffix: "active",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={fadeUp}
          >
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    card.valueColor,
                  )}
                >
                  {card.value}
                  {card.suffix && (
                    <span
                      className={cn(
                        "ml-1.5 text-sm font-normal",
                        card.suffixColor ?? "text-muted-foreground",
                      )}
                    >
                      {card.suffix}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* PnL Chart */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={5}
        variants={fadeUp}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Portfolio Growth
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cumulative realized PnL from trade history
              </p>
            </div>
            <Badge
              variant={isPnlPositive ? "default" : "destructive"}
              className="font-mono"
            >
              {isPnlPositive ? "+" : ""}
              {totalPnl.toFixed(2)} USDT
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlsafeData}>
                  <defs>
                    <linearGradient
                      id="pnlGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          isPnlPositive
                            ? "hsl(152, 69%, 41%)"
                            : "hsl(0, 84%, 60%)"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          isPnlPositive
                            ? "hsl(152, 69%, 41%)"
                            : "hsl(0, 84%, 60%)"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "PnL",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke={
                      isPnlPositive ? "hsl(152, 69%, 41%)" : "hsl(0, 84%, 60%)"
                    }
                    strokeWidth={2}
                    fill="url(#pnlGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Info & Balances */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={6}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Balances */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
              Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Free</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(safeData?.balance || {})
                  .filter(([key]) => !ignoreKeys.includes(key))
                  .map(([symbol, bal]) => {
                    return (
                      <TableRow key={symbol}>
                        <TableCell className="font-mono font-medium">
                          {symbol}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-status-running">
                          {(bal.free as number | undefined) ?? 0}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {(bal.used as number | undefined) ?? 0}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {(bal.total as number | undefined) ?? 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Positions & Trades Tabs */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={7}
        variants={fadeUp}
      >
        <Tabs defaultValue="positions" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="positions" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Positions
              </TabsTrigger>
              <TabsTrigger value="trades" className="gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Trades
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Positions Tab */}
          <TabsContent value="positions">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="text-right">Entry</TableHead>
                        <TableHead className="text-right">Mark</TableHead>
                        <TableHead className="text-right">Liq. Price</TableHead>
                        <TableHead className="text-right">Leverage</TableHead>
                        <TableHead className="text-right">uPnL</TableHead>
                        <TableHead className="text-right">ROE %</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeData.positions.map((pos: Position) => {
                        const isLong = pos.side === "long";
                        const pnlPositive = (pos.unrealizedPnl ?? 0) >= 0;
                        return (
                          <TableRow key={pos.id}>
                            <TableCell className="font-mono font-medium">
                              {pos.symbol}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isLong ? "default" : "destructive"}
                                className="uppercase text-xs"
                              >
                                {isLong ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {JSON.stringify(pos.side, null, 2)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {pos.contracts}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-mono">
                              ${pos.entryPrice?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-mono">
                              ${pos.info.mark_price?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-mono text-primary">
                              ${pos.liquidationPrice?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {JSON.stringify(pos.leverage, null, 2)}x
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums font-medium",
                                pnlPositive
                                  ? "text-green-500"
                                  : "text-red-500",
                              )}
                            >
                              {pnlPositive ? "+" : ""}
                              {pos.info.unrealized_pnl}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums font-medium",
                                pnlPositive
                                  ? "text-status-running"
                                  : "text-destructive",
                              )}
                            >
                              {pnlPositive ? "+" : ""}
                              {pos.percentage?.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs uppercase"
                              >
                                {pos.info.margin}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {safeData?.positions.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center py-12 text-muted-foreground italic"
                          >
                            No open positions
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades" className="mb-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Fee</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...safeData?.trades].reverse().map((trade) => {
                        const isBuy = trade.side === "buy";
                        return (
                          <TableRow key={trade.id}>
                            <TableCell className="text-muted-foreground text-xs font-mono whitespace-nowrap">
                              <Clock className="h-3 w-3 inline mr-1.5" />
                              {new Date(
                                Number(trade.timestamp),
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {trade.symbol}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isBuy ? "default" : "destructive"}
                                className="uppercase text-xs"
                              >
                                {isBuy ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {trade.side}
                              </Badge>
                            </TableCell>
                            <TableCell className="uppercase text-xs text-muted-foreground">
                              {trade.type}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-mono">
                              ${(trade.price ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {trade.amount ?? 0}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              ${(trade.cost ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              ${(trade.fee?.cost ?? 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {trade.takerOrMaker}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
