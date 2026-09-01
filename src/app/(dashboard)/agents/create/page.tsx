import CreateAgentPage from "@/features/agents/components/createAgent";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityDetailSkeleton, ErrorView } from "@/components/entityComponents";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <ErrorBoundary
          fallback={<ErrorView message="Failed to load agent form" />}
        >
          <CreateAgentPage />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
