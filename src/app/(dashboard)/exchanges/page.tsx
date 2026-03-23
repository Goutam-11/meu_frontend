import ExchangesPage from "@/features/exchange/components/exchange";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
    <Suspense fallback={<>Loading...</>}>
      <ErrorBoundary fallback={<>Error...</>}>
        <ExchangesPage />
      </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
