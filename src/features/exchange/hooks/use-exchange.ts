import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSuspenseExchanges = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.exchange.getAll.queryOptions());
};
export const useSuspenseExchange = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.exchange.getOne.queryOptions({ id }));
};

export const useCreateExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.exchange.create.mutationOptions({
    onSuccess: (data) => {
      toast.info("Exchange created successfully");
      queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.exchange.getOne.queryOptions({ id: data.id }));
      router.push("/exchanges");
    },
    onError: (error) => {
      toast.error(`Error creating exchange: ${error.message}`);
    }
  }));
};

export const useUpdateExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.exchange.update.mutationOptions({
    onSuccess: (data) => {
      toast.info("Exchange updated successfully");
      queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.exchange.getOne.queryOptions({ id: data.id }));
      router.push("/exchanges");
    },
    onError: (error) => {
      toast.error(`Error updating exchange: ${error.message}`);
    }
  }));
};

export const useDeleteExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.exchange.delete.mutationOptions({
    onSuccess: (data) => {
      toast.info("Exchange deleted successfully");
      queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.exchange.getOne.queryOptions({ id: data.id }));
      router.push("/exchanges");
    },
    onError: (error) => {
      toast.error(`Error deleting exchange: ${error.message}`);
    }
  }));
};