"use client";
import { motion, type Variants } from "framer-motion";
import {
  Bot,
  Activity,
  ShieldCheck,
  Wallet,
  Globe,
  Cpu,
  Clock,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useStatusChangeAgent, useSuspenseAgent, useSuspenseRuns } from "../hooks/use-agent";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};



export default function AgentDetailView({ agentId }: { agentId: string }) {
  const { data: agent } = useSuspenseAgent(agentId);
  const { data: runs } = useSuspenseRuns(agentId);
  const isRunning = agent?.status === "RUNNING";
  const statusChange = useStatusChangeAgent();
  const handleStatusChange = () => {
    statusChange.mutate({ id: agentId, status: isRunning ? "PAUSED" : "RUNNING" });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* L1: Header & Identity */}
      <motion.header
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center border shadow-inner shrink-0">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {agent?.name}
              </h1>
              <Badge variant={isRunning ? "default" : "destructive"} className="px-3">
                <span
                  className={`mr-1.5 inline-block h-2 w-2 rounded-full animate-pulse-dot ${
                    isRunning ? "bg-status-running" : "bg-status-paused"
                  }`}
                />
                {agent?.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm tracking-tight truncate">
              {agent?.id}
            </p>
          </div>
        </div>

        <Button variant="outline" className="shrink-0" onClick={handleStatusChange}>
          {isRunning ? (
            <PauseCircle className="mr-2 h-4 w-4" />
          ) : (
            <PlayCircle className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Pause Agent" : "Resume Agent"}
        </Button>
      </motion.header>

      {/* L2: Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Allocated Capital",
            icon: Wallet,
            value: `${agent?.capital.allocated.toLocaleString()}`,
            suffix: agent?.capital.currency,
          },
          {
            title: "Max Risk / Trade",
            icon: ShieldCheck,
            value: `${agent?.risk.maxRiskPerTradePct}%`,
            suffix: (agent?.risk.maxRiskPerTradePct ?? 0) <= 2 ? "Safe" : "Elevated",
            suffixColor:
              (agent?.risk.maxRiskPerTradePct ?? 0) <= 2
                ? "text-status-running"
                : "text-status-paused",
          },
          {
            title: "Max Daily Loss",
            icon: AlertTriangle,
            value: `${agent?.risk.maxDailyLossPct}%`,
            suffix: `${agent?.risk.maxOpenPositions} max positions`,
          },
          {
            title: "Strategy",
            icon: Cpu,
            value: agent?.strategy.replace(/_/g, " "),
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
                <div className="text-2xl font-bold tabular-nums">
                  {card.value}
                  {card.suffix && (
                    <span
                      className={`ml-1.5 text-sm font-normal ${
                        card.suffixColor ?? "text-muted-foreground"
                      }`}
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

      {/* L3: Detailed Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeUp}
          className="lg:col-span-2 space-y-6"
        >
          {/* Market Scope */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Market Scope
            </h3>
            <div className="rounded-xl border bg-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Symbols
                </label>
                <div className="flex flex-wrap gap-2">
                  {agent?.market.symbols.map((s) => (
                    <Badge key={s} variant="outline" className="font-mono">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Cycle Frequency
                </label>
                <p className="text-sm font-medium text-foreground">
                  {agent?.market.agentCycles}
                </p>
              </div>
            </div>
          </section>
          {/* Exchange & Credential */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Execution Config
            </h3>
          
            <div className="rounded-xl border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Exchange */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Exchange
                </p>
          
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{agent?.exchange?.name ?? "N/A"}</span>
                  </div>
          
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sandbox</span>
                    <span
                      className={`font-medium ${
                        agent?.exchange?.sandbox
                          ? "text-status-running"
                          : "text-muted-foreground"
                      }`}
                    >
                      {agent?.exchange?.sandbox ? "Enabled" : "Disabled"}
                    </span>
                  </div>
          
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Public URL</span>
                    <p className="font-mono text-xs truncate">
                      {agent?.exchange?.urls?.public ?? "N/A"}
                    </p>
                  </div>
          
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Private URL</span>
                    <p className="font-mono text-xs truncate">
                      {agent?.exchange?.urls?.private ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
          
              {/* Credential */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Credential
                </p>
          
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {agent?.credential?.type ?? "N/A"}
                    </span>
                  </div>
          
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credential ID</span>
                    <span className="font-mono text-xs truncate max-w-[140px]">
                      {agent?.credentialId ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>
          
            </div>
          </section>

          {/* Intelligence Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Intelligence Settings
            </h3>
            <div className="rounded-xl border bg-card p-6 grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { label: "Model", value: agent?.llmModel ?? "N/A" },
                { label: "Temperature", value: String(agent?.temperature), mono: true },
                { label: "Exchange", value: agent?.exchange?.name, mono: true },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {item.label}
                  </p>
                  <p
                    className={`text-sm font-medium text-foreground ${
                      item.mono ? "font-mono" : ""
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
        
       

        {/* Sidebar: Metadata */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={6}
          variants={fadeUp}
          className="space-y-6"
        >
          <Card className="bg-muted/30 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
                System Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Type", value: agent?.type },
                { label: "Agent ID", value: agent?.id, mono: true, truncate: true },
                {
                  label: "Last Run",
                  value: agent?.lastRun
                    ? new Date(agent?.lastRun).toLocaleString()
                    : "Never",
                  tabular: true,
                },
                {
                  label: "Next Run",
                  value: "Scheduled",
                  tabular: true,
                },
                {
                  label: "Created",
                  value: agent?.createdAt
                    ? new Date(agent?.createdAt).toLocaleDateString()
                    : "Unknown",
                },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm gap-2">
                    <span className="text-muted-foreground shrink-0">{item.label}</span>
                    <span
                      className={`font-medium text-right text-foreground ${
                        item.mono ? "font-mono" : ""
                      } ${item.tabular ? "tabular-nums" : ""} ${
                        item.truncate ? "truncate max-w-[140px]" : ""
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                  {i < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* L4: Agent Runs */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={7}
        variants={fadeUp}
        className="space-y-4 pt-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Execution History
          </h3>
          <Badge variant="outline" className="font-mono">
            {runs.length} runs
          </Badge>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {runs.map((run, i) => (
              <motion.div
                key={run.id}
                initial="hidden"
                animate="visible"
                custom={8 + i * 0.5}
                variants={fadeUp}
                className="p-4 hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(run.createdAt).toLocaleString()}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                      {run.llmResponse}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
            {runs.length === 0 && (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No execution history found for this agent.
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
