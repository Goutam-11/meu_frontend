"use client"
import { useState } from "react";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityList,
  EntityItem,
  EntityAvatar,
  EntityBadge,
  EmptyView,
  EntityPagination,
} from "@/components/entityComponents";
import {
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveNotifications, useSuspenseNotifications } from "../hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { data: notifications } = useSuspenseNotifications();
  const removeNotif = useRemoveNotifications();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "ERROR":
        return { icon: AlertCircleIcon, variant: "destructive" as const };
      case "WARNING":
        return { icon: AlertTriangleIcon, variant: "warning" as const };
      case "INFO":
        return { icon: InfoIcon, variant: "primary" as const };
      default:
        return { icon: InfoIcon, variant: "primary" as const };
    }
  };

  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Notifications"
          description="Stay updated with your latest activities"
        />
      }
      search={
        <div className="flex items-center justify-between gap-4">
          <EntitySearch
            value={search}
            onChange={setSearch}
            placeholder="Search notifications..."
          />
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
      }
      pagination={
        <EntityPagination
          page={page}
          totalPages={2}
          onPageChange={setPage}
        />
      }
    >
      <EntityList
        items={filteredNotifications}
        getKey={(notif) => notif.id}
        emptyView={
          <EmptyView
            title="No notifications"
            message="You're all caught up!"
          />
        }
        renderItem={(notif) => {
          const config = getTypeConfig(notif.type);
          const isRead = notif.status === "READ";
          return (
            <EntityItem
              title={notif.title}
              subtitle={notif.message}
              image={
                <EntityAvatar
                  icon={config.icon}
                  variant={config.variant}
                />
              }
              badge={!isRead && <EntityBadge variant="success">New</EntityBadge>}
              actions={
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              }
              className={cn("flex flex-row items-center h-16 ",isRead ? "opacity-60" : "")}
              onRemove={() => removeNotif.mutate({id:notif.id})}
              onClick={() => router.push(`/notifications/${notif.id}`)}
            />
          );
        }}
      />
    </EntityContainer>
  );
}
