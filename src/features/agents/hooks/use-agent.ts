import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseAgents = ({ page, search }: {
  page: number;
  search: string;
}) => {
  const trpc = useTRPC();
  
  return useSuspenseQuery(trpc.agents.getAll.queryOptions({ page, search }))
}

export const useSuspenseAgent = (id:string) => {
  const trpc = useTRPC();
  
  return useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: id }))
}

export const useCreateAgent = () => { 
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return useMutation(trpc.agents.create.mutationOptions({
    onSuccess: () => {
      toast.info("Agent created successfully");
      queryClient.invalidateQueries(trpc.agents.getAll.queryOptions({}));
    },
    onError: (error) => {
      toast.error(`Error creating agent: ${error.message}`);
    }
  }));
}
export const useUpdateAgent = () => { 
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return useMutation(trpc.agents.update.mutationOptions({
    onSuccess: (data) => {
      toast.info("Agent updated successfully");
      queryClient.invalidateQueries(trpc.agents.getAll.queryOptions({}));
      queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: data.id }));
    },
    onError: (error) => {
      toast.error(`Error updating agent: ${error.message}`);
    }
  }));
}

export const useDeleteAgent = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return useMutation(trpc.agents.delete.mutationOptions({
    onSuccess: (data) => {
      toast.info("Agent deleted successfully");
      queryClient.invalidateQueries(trpc.agents.getAll.queryOptions({}));
      queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: data.id }));
    },
    onError: (error) => {
      toast.error(`Error deleting agent: ${error.message}`);
    }
  }));
}

export const useStatusChangeAgent = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return useMutation(trpc.agents.statusChange.mutationOptions({
    onSuccess: (data) => {
      toast.info("Agent status changed successfully");
      queryClient.invalidateQueries(trpc.agents.getAll.queryOptions({}));
      queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: data.id }));
    },
    onError: (error) => {
      toast.error(`Error changing agent status: ${error.message}`);
    }
  }));
}

export const useSuspenseRuns = (id:string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.agents.runs.queryOptions({ agentId: id }));
}
