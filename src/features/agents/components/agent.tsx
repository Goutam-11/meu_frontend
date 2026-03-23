"use client";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityList,
  EntityItem,
  EntityPagination,
  EntityAvatar,
  EntityBadge,
  EmptyView,
} from "@/components/entityComponents";
import { useState, useCallback } from "react";
import { BotIcon } from "lucide-react";
import { useDeleteAgent, useSuspenseAgents } from "../hooks/use-agent";
import { Status } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { formatDate, formatDistanceToNow } from "date-fns";

export function AgentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const deleteAgent = useDeleteAgent();

  // Fetch data with pagination and search
  const { data } = useSuspenseAgents({ page,search});
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case Status.RUNNING:
        return "success";
      case Status.PAUSED:
        return "warning";
      default:
        return "default";
    }
  };

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
      <EntityList
        items={agents}
        getKey={(agent) => agent.id}
        emptyView={
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
        }
        renderItem={(agent) => (
          <EntityItem
            title={agent.name}
            className="flex flex-row h-18 w-full justify-between items-center"
            subtitle={`Created ${formatDate(
              agent.createdAt,
              "dd MMMM yyyy"
            )} • Last updated ${formatDistanceToNow(
              new Date(agent.updatedAt),
              {
                addSuffix: true,
              }
            )}`}
            image={
              <EntityAvatar
                icon={BotIcon}
                variant={
                  agent.status === Status.RUNNING ? "primary" : "default"
                }
                size="lg"
              />
            }
            badge={
              <EntityBadge variant={getStatusVariant(agent.status)}>
                {agent.status}
              </EntityBadge>
            }
            onEdit={() => router.push(`/agents/${agent.id}/edit`)}
            onRemove={() => deleteAgent.mutate({ id: agent.id })}
            onClick={() => router.push(`/agents/${agent.id}`)}
          />
        )}
      />
    </EntityContainer>
  );
}
