import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";


export const useSuspenseNotifications = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.notifications.getAll.queryOptions()
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
          trpc.notifications.getAll.queryOptions()
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
        toast.success("Notification marked as read");
        queryClient.invalidateQueries(
          trpc.notifications.getAll.queryOptions()
        );
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to mark notification as read ${error.message}`);
      },
    })
  );
};

