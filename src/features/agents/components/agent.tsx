"use client";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityPagination,
  EmptyView,
} from "@/components/entityComponents";
import { useState, useCallback } from "react";
import { useDeleteAgent, useSuspenseAgents } from "../hooks/use-agent";
import { Status } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { PencilIcon, Trash2Icon } from "lucide-react";

function StatusPill({ status }: { status: string }) {
  const isRunning = status === Status.RUNNING;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-inset",
        isRunning
          ? "bg-status-running/10 text-status-running ring-status-running/30"
          : "bg-muted text-muted-foreground ring-border"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isRunning ? "pulse-dot bg-status-running" : "bg-muted-foreground"
        )}
      />
      {status}
    </span>
  );
}

export function AgentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const deleteAgent = useDeleteAgent();

  // Fetch data with pagination and search
  const { data } = useSuspenseAgents({ page, search });
  const agents = data.agents;
  const pagination = data.pagination;

  // Debounce search to avoid excessive re-renders
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Agents"
          description="Manage your AI agents and their configurations"
          newButtonLabel="New Agent"
          onNew={() => router.push("/agents/create")}
        />
      }
      search={
        <EntitySearch
          value={search}
          onChange={handleSearch}
          placeholder="Search agents by name..."
        />
      }
      pagination={
        <EntityPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      }
    >
      {agents.length === 0 ? (
        <EmptyView
          title={search ? "No agents found" : "No agents yet"}
          message={
            search
              ? "Try adjusting your search criteria"
              : "Create your first AI agent to get started"
          }
          onNew={() => router.push("/agents/create")}
          newButtonLabel="Create Agent"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const isRunning = agent.status === Status.RUNNING;
            return (
              <article
                key={agent.id}
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="group relative cursor-pointer overflow-hidden border border-border bg-card p-5 transition-all duration-150 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* gradient hairline — mint accent sweep */}
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
                    isRunning
                      ? "via-status-running/70"
                      : "via-foreground/15"
                  )}
                />

                {/* headline stat + status — challenge-card anatomy */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-2xl font-bold tracking-tight tabular-nums">
                      {agent.capital?.allocated ?? 0}
                    </p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                      allocated capital
                    </p>
                  </div>
                  <StatusPill status={agent.status} />
                </div>

                <div className="mt-3 flex min-w-0 items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-inset ring-border">
                    ID #{agent.id.slice(0, 6)}
                  </span>
                  <span className="truncate font-semibold text-foreground">
                    {agent.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">·</span>
                  <span className="truncate text-muted-foreground">
                    {agent.market?.symbols?.length
                      ? agent.market.symbols.slice(0, 3).join(" · ")
                      : "No symbols"}
                    {(agent.market?.symbols?.length ?? 0) > 3 && " …"}
                  </span>
                </div>

                {/* stat row */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Model
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium">
                      {(agent.llmModel ?? "default").split("/").pop()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Cycle
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium tabular-nums">
                      {agent.market?.agentCycles}s
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Last run
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium">
                      {agent.lastRun
                        ? formatDistanceToNow(new Date(agent.lastRun), {
                            addSuffix: true,
                          })
                        : "never"}
                    </p>
                  </div>
                </div>

                {/* hover actions */}
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 max-md:hidden">
                  <button
                    aria-label="Edit agent"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/agents/${agent.id}/edit`);
                    }}
                    className="flex size-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                  >
                    <PencilIcon className="size-3.5" />
                  </button>
                  <button
                    aria-label="Delete agent"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgent.mutate({ id: agent.id });
                    }}
                    className="flex size-8 items-center justify-center rounded-full border border-destructive/40 bg-background/60 text-destructive backdrop-blur transition-colors hover:bg-destructive/10"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </EntityContainer>
  );
}
