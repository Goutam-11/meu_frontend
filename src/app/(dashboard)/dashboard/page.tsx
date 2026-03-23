import { ExchangeDashboard } from "@/features/exchange/components/ExchangeDashboard";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth()
  return <ExchangeDashboard/>
}

export default Page;