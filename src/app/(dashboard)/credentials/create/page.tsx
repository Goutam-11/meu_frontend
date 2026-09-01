import CreateCredentialPage from "@/features/credentials/components/createCred";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  return <CreateCredentialPage />;
};

export default Page;
