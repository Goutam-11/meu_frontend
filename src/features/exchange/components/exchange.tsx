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
import { useDeleteExchange, useSuspenseExchangesPaginated } from "../hooks/use-exchange";
import { useRouter } from "next/navigation";


export default function ExchangesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter()
  const deleteExchange = useDeleteExchange();

  const { data } = useSuspenseExchangesPaginated({ page, search });
  const exchanges = data.exchanges;
  const pagination = data.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


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
          onChange={handleSearch}
          placeholder="Search exchanges..."
        />
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
        items={exchanges}
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
            onEdit={() => router.push(`/exchanges/${ex.id}/edit`)}
            onRemove={() => deleteExchange.mutate({id:ex.id})}
          />
        )}
      />
    </EntityContainer>
  );
}
