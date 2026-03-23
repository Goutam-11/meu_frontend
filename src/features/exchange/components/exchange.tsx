"use client";

import { useState } from "react";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityList,
  EntityItem,
  EntityPagination,
  EntityAvatar,
  EntityBadge,
  EmptyView,
} from "@/components/entityComponents";
import { CandlestickChartIcon } from "lucide-react";
import { formatDate, formatDistanceToNow } from "date-fns";
import { useDeleteExchange, useSuspenseExchanges } from "../hooks/use-exchange";
import { useRouter } from "next/navigation";


export default function ExchangesPage() {
  const { data:exchanges } = useSuspenseExchanges()
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter()
  const deleteExchange = useDeleteExchange();

  const filteredExcahnges = exchanges.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Exchanges"
          description="Securely manage Exchange keys and access tokens"
          newButtonLabel="Add Exchange"
          onNew={() => router.push("/exchanges/create")}
        />
      }
      search={
        <EntitySearch
          value={search}
          onChange={setSearch}
          placeholder="Search exchanges..."
        />
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
        items={filteredExcahnges}
        getKey={(ex) => ex.id}
        emptyView={
          <EmptyView
            title="No Exchanges found"
            message="Add your first Exchange key or access token"
            onNew={() => router.push("/exchanges/create")}
            newButtonLabel="Add Exchange"
          />
        }
        renderItem={(ex) => (
          <EntityItem
            title={ex.name}
            className="flex flex-row h-16 items-center"
            subtitle={`Created ${formatDate(ex.createdAt, "dd MMMM yyyy")} • Last used ${formatDistanceToNow(new Date(ex.updatedAt), {
              addSuffix:true
            })}`}
            image={
              <EntityAvatar
                icon={CandlestickChartIcon}
                variant={"default"}
              />
            }
            badge={
              <EntityBadge variant={"success"}>
                {"Active"}
              </EntityBadge>
            }
            // actions={
            //   <div className="flex items-center gap-1">
            //     <Button
            //       variant="ghost"
            //       size="icon"
            //       className="size-8"
            //       onClick={(e) => {
            //         e.preventDefault();
            //         e.stopPropagation();
            //       }}
            //     >
            //       {copiedId === cred.id ? (
            //         <CheckIcon className="size-4 text-emerald-500" />
            //       ) : (
            //         <CopyIcon className="size-4" />
            //       )}
            //     </Button>
            //   </div>
            // }
            onEdit={() => router.push(`/exchanges/${ex.id}/edit`)}
            onRemove={() => deleteExchange.mutate({id:ex.id})}
          />
        )}
      />
    </EntityContainer>
  );
}
