"use client";
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
  Server,
  Bot,
  ArrowLeftRight,
  Code,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useMarkAsRead, useSuspenseNotification } from "../hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const typeConfig = {
  ERROR: { icon: AlertCircle, badge: "error" as const, color: "text-red-600 " },
  WARNING: { icon: AlertTriangle, badge: "warning" as const, color: "text-yellow-500" },
  INFO: { icon: Info, badge: "info" as const, color: "text-blue-600" },
};

const sourceIcon = {
  AGENT: Bot,
  SYSTEM: Server,
  EXCHANGE: ArrowLeftRight,
};


const statusConfig = {
  UNREAD: { icon: EyeOff, label: "Unread" },
  READ: { icon: Eye, label: "Read" },
  ACKNOWLEDGED: { icon: CheckCircle2, label: "Acknowledged" },
};


export default function NotificationDetailView({
  notifId,
}: { notifId: string }) {
  const { data: notification } = useSuspenseNotification(notifId);
  const typeCfg = typeConfig[notification?.type ?? "INFO"];
  const metadata = notification?.metadata ?? ""
  const Variant = typeCfg.badge === "info" ? "default" : typeCfg.badge === "error" ? "destructive" : "secondary";
  const TypeIcon = typeCfg.icon;
  const SourceIcon = sourceIcon[notification!.source];
  const statusCfg = statusConfig[notification!.status];
  const StatusIcon = statusCfg.icon;
  const markAsRead = useMarkAsRead();
  
  const handleMarkAsRead = () => {
    markAsRead.mutate({ id: notifId });
  };
  
  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "—";
  
    if (typeof value === "object") {
      return (
        <div className="ml-4 border-l pl-3 space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <span className="font-medium capitalize">{key}: </span>
              {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }
  
    return String(value);
  };

  return (
    <div className="h-full bg-background p-4 sm:p-6 lg:p-10 space-y-8 w-full max-h-full overflow-auto mx-auto">
      {/* Header */}
      <motion.header
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className={`h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center border shadow-inner shrink-0`}>
            <Bell className={`h-10 w-10 ${typeCfg.color}`} />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {notification?.title}
              </h1>
              <Badge variant={Variant} className="px-3">
                <TypeIcon className="mr-1.5 h-3 w-3" />
                {notification?.type}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm tracking-tight truncate">
              {notification?.id}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Badge variant="outline" className="px-3 py-1.5">
            <StatusIcon className="mr-1.5 h-3 w-3" />
            {statusCfg.label}
          </Badge>
          {notification?.status === "UNREAD" && (
            <Button variant="outline" size="sm" onClick={handleMarkAsRead}>
              <Eye className="mr-2 h-4 w-4" />
              Mark as Read
            </Button>
          )}
        </div>
      </motion.header>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Source",
            icon: SourceIcon,
            value: notification?.source,
          },
          {
            title: "Error Code",
            icon: AlertCircle,
            value: notification?.code ?? "—",
          },
          {
            title: "Created",
            icon: Clock,
            value: `${
              formatDistanceToNow(new Date(notification!.createdAt), {
              addSuffix: true,
            })}`,
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
              <CardHeader className="flex flex-row items-center justify-between  space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold font-mono">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Message & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeUp}
          className="lg:col-span-2 space-y-6"
        >
          {/* Message */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-4 w-4 text-muted-foreground" />
              Message
            </h3>
            <div className="rounded-xl border bg-card p-6">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {notification?.message}
              </p>
            </div>
          </section>

          {/* Metadata */}
          {notification?.metadata && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Code className="h-4 w-4 text-muted-foreground" />
                Metadata
              </h3>
              <div className="rounded-xl border bg-card p-6">
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                  {renderValue(metadata)}
                </pre>
              </div>
            </section>
          )}
        </motion.div>

        {/* Sidebar */}
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
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Notification ID", value: notification?.id, mono: true, truncate: true },
                { label: "Type", value: notification?.type },
                { label: "Source", value: notification?.source },
                { label: "Status", value: notification?.status },
                ...(notification?.userId ? [{ label: "User ID", value: notification?.userId, mono: true, truncate: true }] : []),
                ...(notification?.agentId ? [{ label: "Agent ID", value: notification?.agentId, mono: true, truncate: true }] : []),
                ...(notification?.exchangeId ? [{ label: "Exchange ID", value: notification?.exchangeId, mono: true, truncate: true }] : []),
                {
                  label: "Created At",
                  value: new Date(notification!.createdAt).toLocaleString(),
                  tabular: true,
                },
                ...(notification?.readAt
                  ? [{ label: "Read At", value: new Date(notification?.readAt).toLocaleString(), tabular: true }]
                  : []),
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
    </div>
  );
}
