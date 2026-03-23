import SignupForm from "@/components/signup"
import { requireNoAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireNoAuth();
  return <SignupForm/>
};

export default Page;