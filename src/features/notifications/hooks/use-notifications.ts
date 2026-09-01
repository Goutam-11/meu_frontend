import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const useSuspenseNotifications = ({
  page,
  search,
}: {
  page: number;
  search: string;
}) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.notifications.getAll.queryOptions({ page, search })
  );
};

/**
 * Live connection (SSE) that invalidates notification queries the moment a
 * new notification arrives or one is read — from any tab or device.
 */
export const useNotificationUpdates = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useSubscription(
    trpc.notifications.onUpdate.subscriptionOptions(undefined, {
      onData: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.getUnread.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.getAll.queryKey(),
        });
      },
      onError: (err) => console.error("notification subscription error", err),
    })
  );
};

export const useUnreadNotifications = () => {
  const trpc = useTRPC();
  return useQuery(
    trpc.notifications.getUnread.queryOptions(undefined, {
      // Live updates come from useNotificationUpdates; this is a safety net
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
    })
  );
};

export const useSuspenseNotification = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.notifications.getOne.queryOptions({ id: id })
  );
};

export const useRemoveNotifications = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.notifications.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Notifications removed successfully");
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.notifications.getUnread.queryOptions()
        );
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to remove notification ${error.message}`);
      },
    })
  );
};

export const useMarkAsRead = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.notifications.getUnread.queryOptions()
        );
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to mark notification as read ${error.message}`);
      },
    })
  );
};

export const useMarkAllAsRead = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.notifications.markAllRead.mutationOptions({
      onSuccess: () => {
        toast.success("All notifications marked as read");
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.notifications.getUnread.queryOptions()
        );
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to mark notifications as read ${error.message}`);
      },
    })
  );
};

