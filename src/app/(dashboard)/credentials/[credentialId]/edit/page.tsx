import EditCredentialPage from "@/features/credentials/components/EditCred";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const Page = async ({
  params
}:PageProps) => {
  const { credentialId } = await params;
  return <EditCredentialPage credentialId={credentialId} />
};

export default Page;