import EditAgentPage from "@/features/agents/components/EditAgent";

interface PageProps {
  params: Promise<{
    agentId: string;
  }>;
}

const Page = async({
  params
}: PageProps) => {
  const { agentId } = await params;
  return <EditAgentPage id={agentId} />
};

export default Page;