import { CredentialType } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getAll.queryOptions());
};
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useCredentialByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getByType.queryOptions({ type }));
};

export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.credentials.create.mutationOptions({
    onSuccess: (data) => {
      toast.info("Credential created successfully");
      queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      router.push("/credentials");
    },
    onError: (error) => {
      toast.error(`Failed to create credential: ${error.message}`);
    }
  }))
}

export const useEditCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.credentials.update.mutationOptions({
    onSuccess: (data) => {
      toast.info("Credential updated successfully");
      queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      router.push("/credentials");
    },
    onError: (error) => {
      toast.error(`Failed to update credential: ${error.message}`);
    }
  }))
}

export const useDeleteCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(trpc.credentials.delete.mutationOptions({
    onSuccess: (data) => {
      toast.info("Credential deleted successfully");
      queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
      queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      router.push("/credentials");
    },
    onError: (error) => {
      toast.error(`Failed to delete credential: ${error.message}`);
    }
  }))
}