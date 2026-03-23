interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { credentialId } = await params;
  return (
    <div>
      <h1>Agent id: {credentialId}</h1>
    </div>
  );
};

export default Page;