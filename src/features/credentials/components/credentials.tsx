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
import { KeyIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { formatDate, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function CredentialsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const deleteCredential = useDeleteCredential();

  const { data } = useSuspenseCredentials({ page, search });
  const credentials = data.credentials;
  const pagination = data.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(key);
    toast.info("Credential copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <EntityContainer
      className="flex flex-col overflow-auto w-full h-full"
      header={
        <EntityHeader
          title="Credentials"
          description="Securely manage your API keys and access tokens"
          newButtonLabel="Add Credential"
          onNew={() => router.push("/credentials/create")}
        />
      }
      search={
        <EntitySearch
          value={search}
          onChange={handleSearch}
          placeholder="Search credentials..."
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
        items={credentials}
        getKey={(cred) => cred.id}
        emptyView={
          <EmptyView
            title="No credentials found"
            message="Add your first API key or access token"
            onNew={() => router.push("/credentials/create")}
            newButtonLabel="Add Credential"
          />
        }
        renderItem={(cred) => (
          <EntityItem
            title={cred.type}
            className="flex flex-row h-18 items-center"
            subtitle={`Created ${formatDate(cred.createdAt, "dd MMMM yyyy")} • Last used ${formatDistanceToNow(new Date(cred.updatedAt), {
              addSuffix:true
            })}`}
            image={
              <EntityAvatar
                icon={KeyIcon}
                variant={"default"}
              />
            }
            badge={
              <EntityBadge variant={"success"}>
                {"Active"}
              </EntityBadge>
            }
            actions={
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopy(cred.apiKey);
                  }}
                >
                  {copiedId === cred.id ? (
                    <CheckIcon className="size-4 text-emerald-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            }
            onEdit={() => router.push(`/credentials/${cred.id}/edit`)}
            onRemove={() => deleteCredential.mutate({id: cred.id})}
          />
        )}
      />
    </EntityContainer>
  );
}
