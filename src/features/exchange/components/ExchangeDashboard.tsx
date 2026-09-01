"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
  KeyRound,
  ExternalLink,
  CopyIcon,
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
import { format } from "date-fns";
import { Exchange } from "@/generated/prisma/client";
import {
  useGetExchangeData,
  useKiteAuth,
  useSuspenseExchanges,
} from "../hooks/use-exchange";
import type { Balances, Position, Trade } from "ccxt";


interface ExchangeData {
  positions?: Position[] | undefined;
  trades?: Trade[] | undefined;
  balance?: Balances | undefined;
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
  error: any;
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

  const trpcError = error as any;
  
  const errorTitle = trpcError.data?.code || "UNKNOWN_ERROR";
  const errorDescription = trpcError.data?.message || "Unknown error occurred no data available.";

 

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

/**
 * Zerodha daily re-auth card. Kite access tokens are valid for ONE trading
 * day — when expired, the dashboard shows this instead of portfolio data.
 * If the Kite app&apos;s redirect URL points back at /exchanges?kite=<exchangeId>,
 * the request_token is picked up and exchanged automatically.
 */
function ZerodhaReauth({
  exchangeId,
  exchangeName,
  loginUrl,
}: {
  exchangeId: string;
  exchangeName: string;
  loginUrl: string | null;
}) {
  const kiteAuth = useKiteAuth(exchangeId);
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-complete when redirected back from the Kite login page
  const requestToken = searchParams.get("request_token");
  const kiteExchangeId = searchParams.get("kite");
  useEffect(() => {
    if (
      requestToken &&
      kiteAuth.isPending === false &&
      kiteAuth.isSuccess === false &&
      (!kiteExchangeId || kiteExchangeId === exchangeId)
    ) {
      kiteAuth.mutate(
        { id: exchangeId, requestToken },
        {
          onSettled: () => router.replace("/exchanges"),
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestToken, kiteExchangeId, exchangeId]);

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4 text-chart-1" />
          Zerodha session required — {exchangeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Kite access tokens are valid for <strong>one trading day</strong>.
          Log in to Zerodha to activate today&apos;s session — your agents resume
          automatically once the session is active.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {loginUrl && (
            <Button onClick={() => window.open(loginUrl, "_blank", "noopener")}>
              <ExternalLink className="size-4" />
              Log in to Zerodha
            </Button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="…or paste request_token here"
              className="h-9 w-full min-w-40 border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={token.trim().length < 10 || kiteAuth.isPending}
              onClick={() => kiteAuth.mutate({ id: exchangeId, requestToken: token })}
            >
              {kiteAuth.isPending ? "Activating…" : "Activate"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            For automatic token exchange, set this as the redirect URL in your
            Kite app settings (developers.kite.trade → your app → Postman URL):
          </p>
          <div className="flex items-center gap-2">
            <code
              className="min-w-0 flex-1 truncate border border-border bg-secondary/60 px-3 py-2 font-mono text-[11px] text-foreground"
            >
              {typeof window !== "undefined"
                ? `${window.location.origin}/exchanges?kite=${exchangeId}`
                : `/exchanges?kite=${exchangeId}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={async () => {
                const url =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/exchanges?kite=${exchangeId}`
                    : `/exchanges?kite=${exchangeId}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success("Redirect URL copied");
                } catch {
                  toast.error("Copy failed — select the URL manually");
                }
              }}
            >
              <CopyIcon className="size-3.5" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            After login Zerodha redirects here with the request_token — it is
            exchanged automatically and today&apos;s session activates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 space-y-8">
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

  const {
    data,
    safeData,
    warnings,
    isLoading,
    error,
    isTotallyBroken,
    refetch,
    kiteTokenExpired,
    kiteLoginUrl,
  } = useGetExchangeData(selectedExchange.id);
  

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
      (sum: number, p: Position) => sum + Number(p.info.unrealized_pnl ?? 0),
      0,
    ) ?? 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Zerodha daily token expired → re-auth flow instead of empty portfolio
  if (kiteTokenExpired) {
    return (
      <div className="h-full w-full bg-background p-4 sm:p-6 lg:p-10 space-y-8">
        <motion.header
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="flex items-center gap-5"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1 ring-1 ring-inset ring-chart-1/25 shrink-0">
            <ArrowUpDown className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-xs text-muted-foreground">
              {selectedExchange.name} · session expired — re-auth required
            </p>
          </div>
        </motion.header>
        <ZerodhaReauth
          exchangeId={selectedExchange.id}
          exchangeName={selectedExchange.name}
          loginUrl={kiteLoginUrl}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background p-4 sm:p-6 lg:p-10 space-y-8">
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          error={error}
          data={{...data,warnings}}
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
          <div className="flex size-12 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1 ring-1 ring-inset ring-chart-1/25 shrink-0">
            <ArrowUpDown className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor positions · trades · portfolio across connected exchanges
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
            value: safeData?.balance.USD !== undefined ? safeData?.balance.USD.total : 0,
            suffix: "USD",
          },
          {
            title: "Unrealized PnL",
            icon: totalUnrealizedPnl >= 0 ? TrendingUp : TrendingDown,
            value: `${totalUnrealizedPnl}`,
            suffix: "USDT",
            suffixColor:"text-primary",
            valueColor:
              totalUnrealizedPnl >= 0
                ? "text-status-running"
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
                <card.icon className="h-4 w-4 text-primary" />
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
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/15 text-chart-1 ring-1 ring-inset ring-chart-1/30"
              >
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Portfolio Growth
                </CardTitle>
                <p
                  className={cn(
                    "mt-0.5 text-2xl font-bold tracking-tight tabular-nums",
                    isPnlPositive ? "text-foreground" : "text-destructive",
                  )}
                >
                  {isPnlPositive ? "+" : ""}
                  {totalPnl.toFixed(2)}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    USDT
                  </span>
                </p>
              </div>
            </div>
            <Badge
              variant={isPnlPositive ? "default" : "destructive"}
              className="rounded-full"
            >
              {isPnlPositive ? "+" : ""}
              {totalPnl.toFixed(2)} USDT
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlsafeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      color: "var(--popover-foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "PnL",
                    ]}
                  />
                  <defs>
                    <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={
                          isPnlPositive
                            ? "var(--chart-1)"
                            : "var(--destructive)"
                        }
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          isPnlPositive
                            ? "var(--chart-1)"
                            : "var(--destructive)"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke={
                      isPnlPositive ? "var(--chart-1)" : "var(--destructive)"
                    }
                    strokeWidth={2}
                    fill="url(#pnlFill)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: isPnlPositive
                        ? "var(--chart-1)"
                        : "var(--destructive)",
                      stroke: "var(--background)",
                      strokeWidth: 2,
                    }}
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
        {safeData?.balance.USD !== undefined && <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
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
        </Card>}
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
                        const pnlPositive = Number(pos.info.unrealized_pnl) >= 0;
                        return (
                          <TableRow key={`${pos.symbol}-${pos.side}-${pos.entryPrice}`}>
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
                                {pos.side ?? "—"}
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
                              {pos.leverage != null ? `${pos.leverage}x` : "—"}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right tabular-nums font-medium",
                                pnlPositive
                                  ? "text-status-running"
                                  : "text-destructive",
                              )}
                            >
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
                              {format(
                                new Date(Number(trade.timestamp)),
                                "MMM d, yyyy HH:mm:ss",
                              )}
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
                      {safeData?.trades.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-12 text-muted-foreground italic"
                          >
                            No trades yet
                          </TableCell>
                        </TableRow>
                      )}
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
