import NotificationDetailView from "@/features/notifications/components/NotificationView";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityDetailSkeleton, ErrorView } from "@/components/entityComponents";

interface PageProps {
  params: Promise<{
    notificationId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { notificationId } = await params;
  return (
    <HydrateClient>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <ErrorBoundary
          fallback={<ErrorView message="Failed to load notification" />}
        >
          <NotificationDetailView notifId={notificationId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
