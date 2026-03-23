interface PageProps {
  params: Promise<{
    exchangeId: string;
  }>;
}

const Page = async ({
  params
}: PageProps) => {
  const { exchangeId } = await params;
  return (
    <div>
      <h1>Edit Exchange id : { exchangeId }</h1>
      {/* Add your edit form here */}
    </div>
  );
};

export default Page;