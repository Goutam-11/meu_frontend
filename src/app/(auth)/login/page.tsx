import LoginForm from "@/components/login"
import { requireNoAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireNoAuth();
  return <LoginForm/>
};

export default Page;