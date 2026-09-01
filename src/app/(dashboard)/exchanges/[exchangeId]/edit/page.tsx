import EditExchangePage from "@/features/exchange/components/EditExchange";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityDetailSkeleton, ErrorView } from "@/components/entityComponents";

interface PageProps {
  params: Promise<{
    exchangeId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { exchangeId } = await params;
  return (
    <HydrateClient>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <ErrorBoundary
          fallback={<ErrorView message="Failed to load exchange editor" />}
        >
          <EditExchangePage id={exchangeId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
