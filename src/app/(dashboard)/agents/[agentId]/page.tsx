import AgentDetailView from "@/features/agents/components/AgentDetailView";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityDetailSkeleton, ErrorView } from "@/components/entityComponents";

interface PageProps {
  params: Promise<{
    agentId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { agentId } = await params;
  return (
    <HydrateClient>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <ErrorBoundary
          fallback={<ErrorView message="Failed to load agent" />}
        >
          <AgentDetailView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
