import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Balances, Position, Trade } from "ccxt";

export const useSuspenseExchanges = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.exchange.getAll.queryOptions());
};

export const useSuspenseExchangesPaginated = ({
  page,
  search,
}: {
  page: number;
  search: string;
}) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.exchange.getPaginated.queryOptions({ page, search })
  );
};
export const useSuspenseExchange = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.exchange.getOne.queryOptions({ id }));
};

export const useCreateExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(
    trpc.exchange.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Exchange created successfully");
        queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
        queryClient.invalidateQueries(
          trpc.exchange.getOne.queryOptions({ id: data.id }),
        );
        router.push("/exchanges");
      },
      onError: (error) => {
        toast.error(`Error creating exchange: ${error.message}`);
      },
    }),
  );
};

export const useUpdateExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(
    trpc.exchange.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("Exchange updated successfully");
        queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
        queryClient.invalidateQueries(
          trpc.exchange.getOne.queryOptions({ id: data.id }),
        );
        router.push("/exchanges");
      },
      onError: (error) => {
        toast.error(`Error updating exchange: ${error.message}`);
      },
    }),
  );
};

export const useDeleteExchange = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(
    trpc.exchange.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success("Exchange deleted successfully");
        queryClient.invalidateQueries(trpc.exchange.getAll.queryOptions());
        queryClient.invalidateQueries(
          trpc.exchange.getOne.queryOptions({ id: data.id }),
        );
        router.push("/exchanges");
      },
      onError: (error) => {
        toast.error(`Error deleting exchange: ${error.message}`);
      },
    }),
  );
};

export const useGetExchangeData = (exchangeId: string) => {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.exData.getById.queryOptions(
      { id: exchangeId },
      {
        enabled: !!exchangeId,
        retry: 2,
        refetchInterval: 5000,
        staleTime: 0,
      }
    )
  );

  const data = query.data;

  // Zerodha daily token state — when expired the UI shows the re-auth flow
  const kiteData = data as { kiteTokenExpired?: boolean; loginUrl?: string | null } | undefined;
  const kiteTokenExpired: boolean = kiteData?.kiteTokenExpired === true;
  const kiteLoginUrl: string | null = kiteData?.loginUrl ?? null;

  //Normalize partial errors into warnings
  const warnings = kiteTokenExpired
    ? []
    : [
        data?.positionsError && `Positions: ${data.positionsError}`,
        data?.tradesError && `Trades: ${data.tradesError}`,
        data?.balanceError && `Balance: ${data.balanceError}`,
      ].filter(Boolean) as string[];

  //Safe fallback data
  const safeData = {
    positions: data?.positions as Position[] ?? [],
    trades: data?.trades as Trade[] ?? [],
    balance: data?.balance as Balances ?? {},
  };

  //Detect total failure
  const isTotallyBroken =
    !kiteTokenExpired &&
    !!data?.positionsError &&
    !!data?.tradesError &&
    !!data?.balanceError;

  return {
    ...query,
    data,
    safeData,
    warnings,
    isTotallyBroken,
    kiteTokenExpired,
    kiteLoginUrl,
  };
};

/** Zerodha daily re-auth: submit a login request_token to activate the session. */
export const useKiteAuth = (exchangeId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.exchange.kiteAuth.mutationOptions({
      retry: false,
      onSuccess: () => {
        toast.success("Zerodha session activated for today");
        queryClient.invalidateQueries({
          queryKey: trpc.exData.getById.queryKey({ id: exchangeId }),
        });
      },
      onError: (error) => {
        toast.error(`Kite auth failed: ${error.message}`);
      },
    }),
  );
};
