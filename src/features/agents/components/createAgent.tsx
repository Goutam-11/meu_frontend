"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AgentType,
  AgentStrategy,
  CredentialType,
} from "@/generated/prisma/enums"; // Ensure these are exported
import { MODELS } from "@/lib/constants";
import { useCreateAgent } from "@/features/agents/hooks/use-agent";
import { CandlestickChartIcon, KeyIcon, Plus, Trash2 } from "lucide-react";
import { useSuspenseExchanges } from "@/features/exchange/hooks/use-exchange";
import { useCredentialByType } from "@/features/credentials/hooks/use-credentials";
import { formatDistanceToNow } from "date-fns";

const CYCLE_OPTIONS = [
  { label: "1 minute", value: "1m" },
  { label: "5 minutes", value: "5m" },
  { label: "15 minutes", value: "15m" },
  { label: "1 hour", value: "1h" },
  { label: "4 hours", value: "4h" },
  { label: "1 day", value: "1d" },
];
// 1. Updated Schema to match Prisma Model
const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  strategy: z.enum(AgentStrategy),
  type: z.enum(AgentType),
  llmModel: z.string(),
  credentialId: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  exchangeId: z.string().min(1, "Exchange ID is required"),
  market: z.object({
    symbols: z.array(
      z.object({
        value: z.string().min(1, "Symbol is required"),
      }),
    ),
    agentCycles: z.string().min(1, "AgentCycle description is required"), // e.g., "1h", "every 5 mins"
  }),
  risk: z.object({
    maxRiskPerTradePct: z.number().min(0).max(100),
    maxDailyLossPct: z.number().min(0).max(100),
    maxOpenPositions: z.number().int().min(1),
  }),
  capital: z.object({
    allocated: z.float32().min(1, "Capital allocated is required"),
    currency: z.string().min(1, "Currency is required"),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAgentPage() {
  const createAgent = useCreateAgent();
  const { data: exchanges, isLoading: isLoadingExchanges } =
    useSuspenseExchanges();
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialByType(CredentialType.OPENROUTER);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      strategy: AgentStrategy.LLM_TRADING,
      type: AgentType.CRYPTO,
      llmModel: MODELS[0],
      credentialId: "",
      temperature: 0.7,
      exchangeId: "",
      market: {
        symbols: [{ value: "" }],
        agentCycles: "1h",
      },
      risk: {
        maxRiskPerTradePct: 1,
        maxDailyLossPct: 5,
        maxOpenPositions: 3,
      },
      capital: {
        allocated: 100,
        currency: "USDT",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "market.symbols",
  });

  function parseCycleToSeconds(input: string): number {
    const match = input
      .trim()
      .toLowerCase()
      .match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error("Invalid cycle format. Use formats like 5m, 1h, 2d");
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      default:
        throw new Error("Unsupported time unit");
    }
  }

  function onSubmit(values: FormValues) {
    let agentCyclesInSeconds: number;

    try {
      agentCyclesInSeconds = parseCycleToSeconds(values.market.agentCycles);
    } catch (err) {
      form.setError("market.agentCycles", {
        message: err instanceof Error ? err.message : "Invalid format",
      });
      return;
    }

    const payload = {
      ...values,
      market: {
        ...values.market,
        agentCycles: agentCyclesInSeconds, // ✅ converted
        symbols: values.market.symbols.map((s) => s.value),
      },
    };

    createAgent.mutate(payload);
  }

  return (
    <Card className="bg-background h-full w-full border-none shadow-none overflow-auto max-h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Configure Trading Agent</CardTitle>
        <CardDescription>
          Define the identity, strategy, and risk limits for your autonomous
          agent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* --- SECTION: Identity & Strategy --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alpha Bot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AgentStrategy).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AgentType.CRYPTO}>Crypto</SelectItem>
                        <SelectItem value={AgentType.STOCKS}>Stocks</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- SECTION: Intelligence (LLM) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
              <FormField
                control={form.control}
                name="llmModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODELS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature ({field.value})</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        defaultValue={[field.value || 0.7]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCredentials || !credentials?.length}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an OpenRouter credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(credentials) &&
                          credentials.map((credential) => (
                            <SelectItem
                              key={credential.id}
                              value={credential.id}
                            >
                              <div className="flex items-center gap-2">
                                <KeyIcon size={5} />
                                {credential.type} -- {formatDistanceToNow(credential.createdAt)}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The credential will be accessed for the OpenRouter
                      service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- SECTION: Market Scope --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Market Scope
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="exchangeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingExchanges || !exchanges?.length}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an Exchange credential" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(exchanges) &&
                            exchanges.map((exchange) => (
                              <SelectItem key={exchange.id} value={exchange.id}>
                                <div className="flex items-center gap-2">
                                  <CandlestickChartIcon size={5} />
                                  {exchange.name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The exchange will be used to fetch market data and
                        trade.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="market.agentCycles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Cycles</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                      
                        <SelectContent>
                          {CYCLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Frequency of market analysis.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Trading Symbols</FormLabel>
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`market.symbols.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="BTC/USDT" {...field} />
                            </FormControl>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: "" })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Symbol
                  </Button>
                </div>
              </div>
            </div>

            {/* --- SECTION: Risk & Capital --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                  Risk Limits
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="risk.maxRiskPerTradePct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Risk Per Trade (%)</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="risk.maxOpenPositions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Open Positions</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Capital</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="capital.allocated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Allocation</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capital.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Input placeholder="USD" {...field} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={createAgent.isPending}
              className="w-full py-6 text-lg"
            >
              Deploy Agent
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
