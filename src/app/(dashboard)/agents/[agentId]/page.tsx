import AgentDetailView from "@/features/agents/components/AgentDetailView";

interface PageProps {
  params: Promise<{
    agentId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { agentId } = await params;
  return <AgentDetailView agentId={agentId} /> 
};

export default Page;