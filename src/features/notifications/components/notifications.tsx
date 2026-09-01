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
import { useRemoveNotifications, useSuspenseNotifications, useMarkAllAsRead, useUnreadNotifications } from "../hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useSuspenseNotifications({ page, search });
  const notifications = data.notifications;
  const pagination = data.pagination;
  const removeNotif = useRemoveNotifications();
  const markAllRead = useMarkAllAsRead();
  const { data: unreadData } = useUnreadNotifications();
  const router = useRouter();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
            onChange={handleSearch}
            placeholder="Search notifications..."
          />
          <Button
            variant="outline"
            size="sm"
            disabled={(unreadData?.count ?? 0) === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        </div>
      }
      pagination={
        <EntityPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      }
    >
      <EntityList
        items={notifications}
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
