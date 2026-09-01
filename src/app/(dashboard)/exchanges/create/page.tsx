import CreateExchangePage from "@/features/exchange/components/createEx";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  return <CreateExchangePage />;
};

export default Page;
