import NotificationDetailView from "@/features/notifications/components/NotificationView";

interface PageProps {
  params: Promise<{
    notificationId: string;
  }>;
}

const Page = async({
  params
}: PageProps) => {
  const { notificationId } = await params;
  return <NotificationDetailView notifId={notificationId} />
};

export default Page;