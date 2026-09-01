import NotificationsPage from "@/features/notifications/components/notifications";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityListSkeleton, ErrorView } from "@/components/entityComponents";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
      <Suspense fallback={<EntityListSkeleton />}>
        <ErrorBoundary
          fallback={<ErrorView message="Failed to load notifications" />}
        >
          <NotificationsPage />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
