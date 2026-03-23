import EditExchangePage from "@/features/exchange/components/EditExchange";
import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    exchangeId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  requireAuth();
  const { exchangeId } = await params;
  return <EditExchangePage id={exchangeId} />
};

export default Page;